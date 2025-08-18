from flask_restful import Resource, reqparse
from backend.extensions import db
from backend.models.other_expense import OtherExpense
from ..utils.helpers import make_response_data, get_current_user
from ..utils.decorators import role_required
from datetime import datetime

parser = reqparse.RequestParser()
parser.add_argument('expense_type', type=str, required=True)
parser.add_argument('description', type=str, required=False)
parser.add_argument('amount', type=float, required=True)
parser.add_argument('date', type=str, required=True)

class OtherExpensesResource(Resource):
    @role_required('ceo', 'seller', 'driver')
    def get(self):
        expenses = OtherExpense.query.order_by(OtherExpense.date.desc()).all()
        return make_response_data(data=[e.to_dict() for e in expenses], message="Other expenses fetched successfully.")

    @role_required('ceo', 'seller', 'driver')
    def post(self):
        data = parser.parse_args()
        current_user = get_current_user()
        try:
            expense_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return make_response_data(success=False, message="Invalid date format for date. Use YYYY-MM-DD.", status_code=400)
        expense = OtherExpense(
            expense_type=data['expense_type'],
            description=data.get('description'),
            amount=data['amount'],
            date=expense_date,
            user_id=current_user.id
        )
        db.session.add(expense)
        db.session.commit()
        return make_response_data(data=expense.to_dict(), message="Other expense added successfully.", status_code=201)

class OtherExpenseResource(Resource):
    @role_required('ceo', 'seller', 'driver')
    def delete(self, expense_id):
        expense = OtherExpense.query.get(expense_id)
        if not expense:
            return make_response_data(success=False, message="Expense not found.", status_code=404)
        db.session.delete(expense)
        db.session.commit()
        return make_response_data(success=True, message="Expense deleted successfully.")
