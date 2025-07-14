# This is a CONCEPTUAL file showing all Driver routes in one place.
# Your actual implementation uses separate files for each resource.

from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models import Expense, Message, Sale, User, Role
from app.schemas import ExpenseSchema, MessageSchema, SaleSchema
from app.utils.decorators import role_required

# --- From expenses.py ---

expenses_bp = Blueprint('expenses_bp', __name__)
expense_schema = ExpenseSchema()
expenses_schema = ExpenseSchema(many=True)

@expenses_bp.route('/', methods=['POST'])
@role_required(['CEO', 'Purchaser', 'Driver']) # Note: Driver is included
def add_expense():
    data = request.get_json()
    data['added_by'] = get_jwt_identity()
    new_expense = expense_schema.load(data, session=db.session)
    db.session.add(new_expense)
    db.session.commit()
    return jsonify(expense_schema.dump(new_expense)), 201

@expenses_bp.route('/my', methods=['GET'])
@role_required(['CEO', 'Purchaser', 'Driver', 'Seller'])
def get_my_expenses():
    user_id = get_jwt_identity()
    expenses = Expense.query.filter_by(added_by=user_id).all()
    return jsonify(expenses_schema.dump(expenses))


# --- From sales.py ---

sales_bp = Blueprint('sales_bp', __name__)
sale_schema = SaleSchema()
sales_schema = SaleSchema(many=True)

@sales_bp.route('/my-assignments', methods=['GET'])
@role_required('Driver')
def get_my_assignments():
    user = User.query.get(get_jwt_identity())
    assigned_sales = Sale.query.filter(Sale.assignment.like(f"%{user.name}%")).all()
    return jsonify(sales_schema.dump(assigned_sales))


# --- From messages.py ---

messages_bp = Blueprint('messages_bp', __name__)
message_schema = MessageSchema()
messages_schema = MessageSchema(many=True)

@messages_bp.route('/', methods=['GET'])
@role_required(['CEO', 'Store Keeper', 'Seller', 'Purchaser', 'Driver'])
def get_messages():
    user = User.query.get(get_jwt_identity())
    messages = Message.query.filter_by(recipient_role=user.role).order_by(Message.created_at.desc()).all()
    return jsonify(messages_schema.dump(messages))

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