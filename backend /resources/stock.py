from flask_restful import Resource
from flask_jwt_extended import jwt_required

class StockMovementListResource(Resource):
    @jwt_required()
    def get(self):
        # TODO: Implement actual database query
        return {
            'success': True,
            'data': [
                {"id": 1, "product": "Laptop", "movement_type": "IN", "quantity": 10, "date": "2025-08-01"},
                {"id": 2, "product": "Mouse", "movement_type": "OUT", "quantity": 5, "date": "2025-08-02"}
            ]
        }

class ClearStockMovementsResource(Resource):
    @jwt_required()
    def delete(self):
        # TODO: Implement actual clearing logic
        return {'success': True, 'message': 'All stock movements cleared'}