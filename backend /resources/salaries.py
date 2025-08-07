from flask_restful import Resource
from flask_jwt_extended import jwt_required

class SalariesResource(Resource):
    @jwt_required()
    def get(self):
        # TODO: Implement actual database query
        return {
            'success': True,
            'data': [
                {"employee_id": 1, "name": "John Doe", "base_salary": 5000.00, "bonus": 300.00},
                {"employee_id": 2, "name": "Jane Smith", "base_salary": 4500.00, "bonus": 200.00}
            ]
        }

class SalaryPaymentsResource(Resource):
    @jwt_required()
    def get(self):
        # TODO: Implement actual database query
        return {
            'success': True,
            'data': [
                {"id": 1, "employee_id": 1, "amount": 5300.00, "payment_date": "2025-08-01", "status": "Paid"},
                {"id": 2, "employee_id": 2, "amount": 4700.00, "payment_date": "2025-08-01", "status": "Paid"}
            ]
        }