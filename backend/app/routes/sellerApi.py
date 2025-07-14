# This is a CONCEPTUAL file showing all Seller routes in one place.
# Your actual implementation uses separate files for each resource.

from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models import Sale, Expense, Message, User, Role
from app.schemas import SaleSchema, ExpenseSchema, MessageSchema
from app.utils.decorators import role_required

# --- From sales.py ---

sales_bp = Blueprint('sales_bp', __name__)
sale_schema = SaleSchema()
sales_schema = SaleSchema(many=True)

# GET /api/sales - Gets ALL sales for CEO, but ONLY OWN sales for Seller
@sales_bp.route('/', methods=['GET'])
@role_required(['CEO', 'Seller'])
def get_sales():
    user = User.query.get(get_jwt_identity())
    
    if user.role == Role.CEO:
        sales = Sale.query.all()
    else: # This logic handles the Seller case automatically
        sales = Sale.query.filter_by(seller_id=user.id).all()
        
    return jsonify(sales_schema.dump(sales))

# POST /api/sales - Records a new sale for the logged-in seller
@sales_bp.route('/', methods=['POST'])
@role_required('Seller')
def add_sale():
    data = request.get_json()
    seller_id = get_jwt_identity()
    data['seller_id'] = seller_id

    new_sale = sale_schema.load(data, session=db.session)
    db.session.add(new_sale)
    db.session.commit()
    return jsonify(sale_schema.dump(new_sale)), 201


# --- From expenses.py ---

expenses_bp = Blueprint('expenses_bp', __name__)
expense_schema = ExpenseSchema()
expenses_schema = ExpenseSchema(many=True)

# POST /api/expenses - Add an expense (e.g., transport, airtime)
@expenses_bp.route('/', methods=['POST'])
@role_required(['CEO', 'Purchaser', 'Driver', 'Seller']) # Seller is included
def add_expense():
    data = request.get_json()
    data['added_by'] = get_jwt_identity()
    new_expense = expense_schema.load(data, session=db.session)
    db.session.add(new_expense)
    db.session.commit()
    return jsonify(expense_schema.dump(new_expense)), 201

# GET /api/expenses/my - Get expenses added by the current seller
@expenses_bp.route('/my', methods=['GET'])
@role_required(['CEO', 'Purchaser', 'Driver', 'Seller']) # Seller is included
def get_my_expenses():
    user_id = get_jwt_identity()
    expenses = Expense.query.filter_by(added_by=user_id).all()
    return jsonify(expenses_schema.dump(expenses))


# --- From messages.py ---

messages_bp = Blueprint('messages_bp', __name__)
message_schema = MessageSchema()
messages_schema = MessageSchema(many=True)

# GET /api/messages - Gets messages sent to the 'Seller' role
@messages_bp.route('/', methods=['GET'])
@role_required(['CEO', 'Store Keeper', 'Seller', 'Purchaser', 'Driver'])
def get_messages():
    user = User.query.get(get_jwt_identity())
    messages = Message.query.filter_by(recipient_role=user.role).order_by(Message.created_at.desc()).all()
    return jsonify(messages_schema.dump(messages))

# PUT /api/messages/{id}/read - Marks a message as read
@messages_bp.route('/<int:id>/read', methods=['PUT'])
@role_required(['CEO', 'Store Keeper', 'Seller', 'Purchaser', 'Driver'])
def mark_message_as_read(id):
    message = Message.query.get_or_404(id)
    user = User.query.get(get_jwt_identity())
    if message.recipient_role != user.role:
        return jsonify({"msg": "Unauthorized"}), 403
    message.is_read = True
    db.session.commit()
    return jsonify(message_schema.dump(message))