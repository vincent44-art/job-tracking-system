from flask_restful import Resource, reqparse
from datetime import datetime
from models import db, StockMovement
from utils.helpers import make_response_data, get_current_user
from utils.decorators import role_required

class StockMovementListResource(Resource):
    @role_required('ceo', 'storekeeper')
    def get(self):
        movements = StockMovement.query.order_by(StockMovement.date.desc()).all()
        return make_response_data(data=[m.to_dict() for m in movements], message="Stock movements fetched.")

    @role_required('storekeeper')
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('inventory_id', type=int, required=True)
        parser.add_argument('movement_type', type=str, required=True, choices=('in', 'out'))
        parser.add_argument('quantity', type=str, required=True)
        parser.add_argument('unit', type=str)
        parser.add_argument('remaining_stock', type=str)
        parser.add_argument('date', type=str, required=True)
        parser.add_argument('notes', type=str)
        data = parser.parse_args()
        
        current_user = get_current_user()

        try:
            movement_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return make_response_data(success=False, message="Invalid date format. Use YYYY-MM-DD.", status_code=400)

        new_movement = StockMovement(
            inventory_id=data['inventory_id'],
            movement_type=data['movement_type'],
            quantity=data['quantity'],
            unit=data.get('unit'),
            remaining_stock=data.get('remaining_stock'),
            date=movement_date,
            notes=data.get('notes'),
            added_by=current_user.id
        )
        db.session.add(new_movement)
        db.session.commit()
        return make_response_data(data=new_movement.to_dict(), message="Stock movement recorded.", status_code=201)

class ClearStockMovementsResource(Resource):
    @role_required('ceo', 'storekeeper')
    def delete(self):
        try:
            num_deleted = StockMovement.query.delete()
            db.session.commit()
            return make_response_data(message=f"Successfully cleared {num_deleted} stock movements.")
        except Exception as e:
            db.session.rollback()
            return make_response_data(success=False, message="Failed to clear stock movements.", errors=[str(e)], status_code=500)