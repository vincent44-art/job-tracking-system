from flask_restful import Resource
from flask_jwt_extended import jwt_required

class OtherExpensesResource(Resource):
    @jwt_required()
    def get(self):
        # TODO: Implement actual database query
        return {
            'success': True,
            'data': [
                {"id": 1, "description": "Office supplies", "amount": 150.00, "date": "2025-08-01"},
                {"id": 2, "description": "Software licenses", "amount": 299.00, "date": "2025-08-05"}
            ]
        }

class CarExpensesResource(Resource):
    @jwt_required()
    def get(self):
        # TODO: Implement actual database query
        return {
            'success': True,
            'data': [
                {"id": 1, "vehicle": "Company Van", "expense_type": "Fuel", "amount": 85.50, "date": "2025-08-03"},
                {"id": 2, "vehicle": "CEO Car", "expense_type": "Maintenance", "amount": 320.00, "date": "2025-08-10"}
            ]
        }