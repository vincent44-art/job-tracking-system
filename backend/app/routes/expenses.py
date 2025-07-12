from flask import Blueprint, request, jsonify
from app import db
from app.models.expense import Expense
from app.schemas.expense_schema import ExpenseSchema
from app.utils.decorators import role_required
from flask_jwt_extended import jwt_required, get_jwt_identity

expenses_bp = Blueprint('expenses_bp', __name__)
expense_schema = ExpenseSchema()
expenses_schema = ExpenseSchema(many=True)

# Any logged-in user can add an expense, but only CEO can see all of them
@expenses_bp.route('/', methods=['GET'])
@jwt_required()
@role_required('CEO')
def get_expenses():
    """Get all operational expenses."""
    expenses = Expense.query.order_by(Expense.date.desc()).all()
    return jsonify(expenses_schema.dump(expenses))

@expenses_bp.route('/', methods=['POST'])
@jwt_required() # Any authenticated user can add an expense.
def add_expense():
    """Add a new expense record."""
    data = request.get_json()
    user_id = get_jwt_identity()
    try:
        new_expense = expense_schema.load(data, session=db.session)
        new_expense.added_by = user_id
        db.session.add(new_expense)
        db.session.commit()
        return jsonify(expense_schema.dump(new_expense)), 201
    except Exception as e:
        return jsonify({"msg": "Error adding expense", "error": str(e)}), 400

@expenses_bp.route('/clear', methods=['DELETE'])
@jwt_required()
@role_required('CEO')
def clear_expenses():
    """Clear all expense records."""
    try:
        num_rows_deleted = db.session.query(Expense).delete()
        db.session.commit()
        return jsonify({"msg": f"Successfully cleared {num_rows_deleted} expense records."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Failed to clear expenses", "error": str(e)}), 500