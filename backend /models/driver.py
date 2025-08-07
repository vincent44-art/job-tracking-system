# drivers.py (Flask Blueprint)
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

drivers_bp = Blueprint('drivers', __name__, url_prefix='/api/drivers')

@drivers_bp.route('/<driver_email>/expenses', methods=['GET'])
@jwt_required()
def get_driver_expenses(driver_email):
    current_user = get_jwt_identity()
    if current_user['email'] != driver_email and current_user['role'] != 'ceo':
        return jsonify({"msg": "Unauthorized"}), 403

    # TODO: Replace with actual DB query
    expenses = []  # e.g., Expense.query.filter_by(driver_email=driver_email).all()
    return jsonify(expenses), 200

@drivers_bp.route('/expenses', methods=['POST'])
@jwt_required()
def add_driver_expense():
    data = request.get_json()

    # TODO: Add validation and DB insert logic
    # Example stub:
    expense = {
        "id": 1,
        "driver_email": data.get("driver_email"),
        "amount": data.get("amount"),
        "category": data.get("category")
    }

    return jsonify(expense), 201

@drivers_bp.route('/expenses/<expense_id>', methods=['PATCH', 'DELETE'])
@jwt_required()
def handle_expense(expense_id):
    if request.method == 'PATCH':
        data = request.get_json()

        # TODO: Update expense in DB
        updated_expense = {
            "id": expense_id,
            "amount": data.get("amount"),
            "category": data.get("category")
        }

        return jsonify(updated_expense), 200

    elif request.method == 'DELETE':
        # TODO: Delete expense from DB

        return jsonify({"msg": f"Expense {expense_id} deleted"}), 200

@drivers_bp.route('/<driver_email>/profile', methods=['GET', 'PATCH'])
@jwt_required()
def driver_profile(driver_email):
    if request.method == 'GET':
        # TODO: Get profile from DB
        profile = {
            "email": driver_email,
            "name": "John Doe",
            "role": "driver"
        }

        return jsonify(profile), 200

    elif request.method == 'PATCH':
        data = request.get_json()

        # TODO: Update profile in DB
        updated_profile = {
            "email": driver_email,
            "name": data.get("name"),
            "phone": data.get("phone")
        }

        return jsonify(updated_profile), 200
