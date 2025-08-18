from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required
from backend.extensions import db
from backend.models.other_expense import OtherExpense
from ..models.driver import DriverExpense
from ..utils.helpers import make_response_data, get_current_user
from datetime import datetime

class OtherExpensesResource(Resource):
    @jwt_required()
    def get(self):
        expenses = OtherExpense.query.order_by(OtherExpense.date.desc()).all()
        return make_response_data(data=[e.to_dict() for e in expenses], message="Other expenses fetched successfully.")

class CarExpensesResource(Resource):
    @jwt_required()
    def get(self):
        expenses = DriverExpense.query.order_by(DriverExpense.date.desc()).all()
        return make_response_data(data=[e.to_dict() for e in expenses], message="Car expenses fetched successfully.")

    @jwt_required()
    def post(self):
        from flask import request
        data = request.get_json()
        current_user = get_current_user()
        # Validate amount
        amount = data.get('amount')
        if amount is None or amount == '' or not isinstance(amount, (int, float)):
            try:
                amount = float(amount)
            except (TypeError, ValueError):
                return make_response_data(success=False, message="Amount is required and must be a valid number.", status_code=400)
        try:
            expense_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return make_response_data(success=False, message="Invalid date format for date. Use YYYY-MM-DD.", status_code=400)
        expense = DriverExpense(
            driver_email=current_user.email,
            amount=amount,
            category=data.get('category'),
            type=data.get('type'),
            description=data.get('description'),
            date=expense_date
        )
        db.session.add(expense)
        db.session.commit()
        return make_response_data(data={
            "id": expense.id,
            "driver_email": expense.driver_email,
            "amount": expense.amount,
            "category": expense.category,
            "type": expense.type,
            "description": expense.description,
            "date": expense.date.isoformat() if expense.date else None
        }, message="Car expense created", status_code=201)

    @jwt_required()
    def delete(self, expense_id):
        expense = DriverExpense.query.get(expense_id)
        if not expense:
            return make_response_data(success=False, message="Car expense not found.", status_code=404)
        db.session.delete(expense)
        db.session.commit()
        return make_response_data(data=None, message="Car expense deleted successfully.", status_code=200)