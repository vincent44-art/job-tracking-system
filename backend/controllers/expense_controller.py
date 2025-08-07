from flask import Blueprint, request
from datetime import datetime
from models import CarExpense, OtherExpense
from extensions import db
from utils.auth import auth_required, role_required, get_current_user
from utils.response import success_response
from utils.error import bad_request, not_found

bp = Blueprint('expenses', __name__, url_prefix='/api/expenses')

# Car Expenses
@bp.route('/car', methods=['GET'])
@auth_required
@role_required('driver', 'admin', 'ceo')
def get_car_expenses():
    expenses = CarExpense.query.all()
    expenses_data = [{
        'id': expense.id,
        'driver': {
            'id': expense.driver.id,
            'firstName': expense.driver.first_name,
            'lastName': expense.driver.last_name
        },
        'carNumber': expense.car_number,
        'expenseType': expense.expense_type,
        'amount': expense.amount,
        'date': expense.date.isoformat(),
        'description': expense.description,
        'receipt': expense.receipt,
        'approved': expense.approved,
        'approvedBy': {
            'id': expense.approved_by.id,
            'firstName': expense.approved_by.first_name,
            'lastName': expense.approved_by.last_name
        } if expense.approved_by else None
    } for expense in expenses]
    return success_response(expenses_data)

@bp.route('/car', methods=['POST'])
@auth_required
@role_required('driver')
def create_car_expense():
    data = request.get_json()
    current_user = get_current_user()
    
    required_fields = ['car_number', 'expense_type', 'amount', 'date']
    if not all(field in data for field in required_fields):
        return bad_request('Missing required fields')
    
    try:
        date = datetime.fromisoformat(data['date'])
    except ValueError:
        return bad_request('Invalid date format')
    
    expense = CarExpense(
        driver_id=current_user.id,
        car_number=data['car_number'],
        expense_type=data['expense_type'],
        amount=data['amount'],
        date=date,
        description=data.get('description'),
        receipt=data.get('receipt')
    )
    
    db.session.add(expense)
    db.session.commit()
    
    return success_response({
        'id': expense.id,
        'driverId': expense.driver_id,
        'carNumber': expense.car_number,
        'expenseType': expense.expense_type,
        'amount': expense.amount,
        'date': expense.date.isoformat(),
        'description': expense.description,
        'receipt': expense.receipt,
        'approved': expense.approved
    }, status_code=201)

# Other Expenses
@bp.route('/other', methods=['GET'])
@auth_required
@role_required('admin', 'ceo')
def get_other_expenses():
    expenses = OtherExpense.query.all()
    expenses_data = [{
        'id': expense.id,
        'expenseType': expense.expense_type,
        'amount': expense.amount,
        'date': expense.date.isoformat(),
        'description': expense.description,
        'receipt': expense.receipt,
        'processedBy': {
            'id': expense.processed_by.id,
            'firstName': expense.processed_by.first_name,
            'lastName': expense.processed_by.last_name
        },
        'approved': expense.approved,
        'approvedBy': {
            'id': expense.approved_by.id,
            'firstName': expense.approved_by.first_name,
            'lastName': expense.approved_by.last_name
        } if expense.approved_by else None
    } for expense in expenses]
    return success_response(expenses_data)

@bp.route('/other', methods=['POST'])
@auth_required
@role_required('admin')
def create_other_expense():
    data = request.get_json()
    current_user = get_current_user()
    
    required_fields = ['expense_type', 'amount', 'date']
    if not all(field in data for field in required_fields):
        return bad_request('Missing required fields')
    
    try:
        date = datetime.fromisoformat(data['date'])
    except ValueError:
        return bad_request('Invalid date format')
    
    expense = OtherExpense(
        expense_type=data['expense_type'],
        amount=data['amount'],
        date=date,
        description=data.get('description'),
        receipt=data.get('receipt'),
        processed_by_id=current_user.id
    )
    
    db.session.add(expense)
    db.session.commit()
    
    return success_response({
        'id': expense.id,
        'expenseType': expense.expense_type,
        'amount': expense.amount,
        'date': expense.date.isoformat(),
        'description': expense.description,
        'receipt': expense.receipt,
        'processedById': expense.processed_by_id,
        'approved': expense.approved
    }, status_code=201)