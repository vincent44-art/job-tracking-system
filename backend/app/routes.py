# app/routes.py
from flask import Blueprint, request, jsonify
from app import db
from app.models import User, Purchase, SellerAssignment, Sale, CarExpense, OtherExpense
from app.auth import token_required, role_required
import jwt
import datetime
from sqlalchemy import func

bp = Blueprint('api', __name__)

# --- AUTHENTICATION & USER MANAGEMENT ---

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'message': 'Missing required fields'}), 400

    email = data['email'].lower()
    
    # Role validation based on email
    if 'ceo' in email: role = 'ceo'
    elif 'purchaser' in email: role = 'purchaser'
    elif 'seller' in email: role = 'seller'
    elif 'driver' in email: role = 'driver'
    else:
        return jsonify({'message': 'Invalid email format for role assignment'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'User already exists'}), 409
        
    user = User(email=email, name=data['name'], role=role)
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'New user created successfully'}), 201

@bp.route('/login', methods=['POST'])
def login():
    auth = request.authorization
    if not auth or not auth.username or not auth.password:
        return jsonify({'message': 'Could not verify'}), 401, {'WWW-Authenticate': 'Basic realm="Login required!"'}

    user = User.query.filter_by(email=auth.username.lower()).first()
    if not user:
        return jsonify({'message': 'User not found'}), 401
    
    if not user.is_active:
        return jsonify({'message': 'User account is blocked'}), 403

    if user.check_password(auth.password):
        token = jwt.encode({
            'public_id': user.public_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, bp.app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        })
    return jsonify({'message': 'Could not verify, wrong password'}), 401

@bp.route('/users', methods=['GET'])
@role_required('ceo')
def get_all_users(current_user):
    users = User.query.all()
    output = []
    for user in users:
        user_data = {
            'public_id': user.public_id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'is_active': user.is_active
        }
        output.append(user_data)
    return jsonify({'users': output})

@bp.route('/users/<public_id>', methods=['DELETE'])
@role_required('ceo')
def delete_user(current_user, public_id):
    user = User.query.filter_by(public_id=public_id).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404
    user.is_active = False # Block the user
    db.session.commit()
    return jsonify({'message': 'User has been blocked'})

# --- PURCHASE MANAGEMENT ---

@bp.route('/purchases', methods=['POST'])
@role_required('purchaser', 'ceo')
def create_purchase(current_user):
    data = request.get_json()
    new_purchase = Purchase(
        fruit_type=data['fruit_type'],
        quantity=data['quantity'],
        unit=data['unit'],
        buyer_name=data['buyer_name'],
        amount=data['amount'],
        date=datetime.datetime.strptime(data['date'], '%Y-%m-%d'),
        purchaser_id=current_user.id
    )
    db.session.add(new_purchase)
    db.session.commit()
    return jsonify({'message': 'Purchase created successfully', 'id': new_purchase.id}), 201

@bp.route('/purchases', methods=['GET'])
@role_required('purchaser', 'ceo')
def get_purchases(current_user):
    query = Purchase.query
    if current_user.role == 'purchaser':
        query = query.filter_by(purchaser_id=current_user.id)
    
    purchases = query.order_by(Purchase.date.desc()).all()
    output = [{
        'id': p.id,
        'fruit_type': p.fruit_type,
        'quantity': p.quantity,
        'unit': p.unit,
        'buyer_name': p.buyer_name,
        'amount': p.amount,
        'date': p.date.isoformat(),
        'purchaser_name': p.purchaser.name
    } for p in purchases]
    return jsonify(output)


# --- SELLER ASSIGNMENT & SALES ---

@bp.route('/assignments', methods=['POST'])
@role_required('ceo')
def create_assignment(current_user):
    data = request.get_json()
    seller = User.query.filter_by(public_id=data['seller_public_id'], role='seller').first()
    if not seller:
        return jsonify({'message': 'Seller not found'}), 404
        
    new_assignment = SellerAssignment(
        fruit_type=data['fruit_type'],
        quantity_assigned=data['quantity_assigned'],
        money_issued=data.get('money_issued', 0.0),
        travel_date=datetime.datetime.strptime(data['travel_date'], '%Y-%m-%d'),
        seller_id=seller.id
    )
    db.session.add(new_assignment)
    db.session.commit()
    return jsonify({'message': 'Assignment created successfully', 'id': new_assignment.id}), 201

@bp.route('/assignments', methods=['GET'])
@role_required('seller', 'ceo')
def get_assignments(current_user):
    query = SellerAssignment.query
    if current_user.role == 'seller':
        query = query.filter_by(seller_id=current_user.id)

    assignments = query.order_by(SellerAssignment.travel_date.desc()).all()
    output = []
    for a in assignments:
        total_sold = db.session.query(func.sum(Sale.quantity_sold)).filter_by(assignment_id=a.id).scalar() or 0
        total_revenue = db.session.query(func.sum(Sale.revenue_collected)).filter_by(assignment_id=a.id).scalar() or 0
        
        assignment_data = {
            'id': a.id,
            'fruit_type': a.fruit_type,
            'quantity_assigned': a.quantity_assigned,
            'money_issued': a.money_issued,
            'travel_date': a.travel_date.isoformat(),
            'status': a.status,
            'seller_name': a.seller.name,
            'quantity_remaining': a.quantity_assigned - total_sold,
            'total_revenue': total_revenue,
            'sales': [{
                'id': s.id,
                'quantity_sold': s.quantity_sold,
                'revenue_collected': s.revenue_collected,
                'date': s.date.isoformat()
            } for s in a.sales]
        }
        output.append(assignment_data)
    return jsonify(output)

@bp.route('/sales', methods=['POST'])
@role_required('seller')
def record_sale(current_user):
    data = request.get_json()
    assignment = SellerAssignment.query.filter_by(id=data['assignment_id'], seller_id=current_user.id).first()
    if not assignment:
        return jsonify({'message': 'Assignment not found or you are not authorized'}), 404

    # Check stock
    total_sold = db.session.query(func.sum(Sale.quantity_sold)).filter_by(assignment_id=assignment.id).scalar() or 0
    if total_sold + data['quantity_sold'] > assignment.quantity_assigned:
        return jsonify({'message': 'Cannot sell more than assigned quantity'}), 400

    new_sale = Sale(
        quantity_sold=data['quantity_sold'],
        revenue_collected=data['revenue_collected'],
        assignment_id=assignment.id
    )
    db.session.add(new_sale)
    db.session.commit()
    return jsonify({'message': 'Sale recorded successfully', 'id': new_sale.id}), 201

# --- EXPENSE TRACKING ---

@bp.route('/car-expenses', methods=['POST'])
@role_required('driver', 'ceo')
def log_car_expense(current_user):
    data = request.get_json()
    new_expense = CarExpense(
        expense_type=data['expense_type'],
        description=data.get('description', ''),
        amount=data['amount'],
        date=datetime.datetime.strptime(data['date'], '%Y-%m-%d'),
        driver_id=current_user.id if current_user.role == 'driver' else data['driver_id'] # CEO can assign expense to a driver
    )
    db.session.add(new_expense)
    db.session.commit()
    return jsonify({'message': 'Car expense logged successfully'}), 201

@bp.route('/car-expenses', methods=['GET'])
@role_required('driver', 'ceo')
def get_car_expenses(current_user):
    query = CarExpense.query
    if current_user.role == 'driver':
        query = query.filter_by(driver_id=current_user.id)
    
    expenses = query.order_by(CarExpense.date.desc()).all()
    output = [{
        'id': e.id,
        'expense_type': e.expense_type,
        'description': e.description,
        'amount': e.amount,
        'date': e.date.isoformat(),
        'driver_name': e.driver.name
    } for e in expenses]
    return jsonify(output)

@bp.route('/other-expenses', methods=['POST', 'GET'])
@role_required('ceo')
def manage_other_expenses(current_user):
    if request.method == 'POST':
        data = request.get_json()
        new_expense = OtherExpense(
            description=data['description'],
            amount=data['amount'],
            date=datetime.datetime.strptime(data['date'], '%Y-%m-%d')
        )
        db.session.add(new_expense)
        db.session.commit()
        return jsonify({'message': 'Other expense logged successfully'}), 201
    
    # GET request
    expenses = OtherExpense.query.order_by(OtherExpense.date.desc()).all()
    output = [{
        'id': e.id,
        'description': e.description,
        'amount': e.amount,
        'date': e.date.isoformat()
    } for e in expenses]
    return jsonify(output)

# --- ANALYTICS DASHBOARD ---

@bp.route('/analytics/summary', methods=['GET'])
@role_required('ceo')
def get_analytics_summary(current_user):
    total_purchases = db.session.query(func.sum(Purchase.amount)).scalar() or 0
    total_sales = db.session.query(func.sum(Sale.revenue_collected)).scalar() or 0
    total_car_expenses = db.session.query(func.sum(CarExpense.amount)).scalar() or 0
    total_other_expenses = db.session.query(func.sum(OtherExpense.amount)).scalar() or 0

    total_expenses = total_purchases + total_car_expenses + total_other_expenses
    net_profit = total_sales - total_expenses
    profit_margin = (net_profit / total_sales) * 100 if total_sales > 0 else 0

    summary = {
        'total_purchases': round(total_purchases, 2),
        'total_sales': round(total_sales, 2),
        'total_car_expenses': round(total_car_expenses, 2),
        'total_other_expenses': round(total_other_expenses, 2),
        'net_profit': round(net_profit, 2),
        'profit_margin': round(profit_margin, 2)
    }
    return jsonify(summary)