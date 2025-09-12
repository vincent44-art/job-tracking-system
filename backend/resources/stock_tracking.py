from flask_restful import Resource, reqparse
from backend.extensions import db
from backend.models.stock_tracking import StockTracking
from ..utils.helpers import make_response_data
from ..utils.decorators import role_required
from datetime import datetime

parser = reqparse.RequestParser()
parser.add_argument('stockName', type=str, required=True)
parser.add_argument('dateIn', type=str, required=True)
parser.add_argument('fruitType', type=str, required=True)
parser.add_argument('quantityIn', type=float, required=True)
parser.add_argument('amountPerKg', type=float, required=True)
parser.add_argument('totalAmount', type=float, required=True)
parser.add_argument('otherCharges', type=float, default=0)
parser.add_argument('dateOut', type=str)
parser.add_argument('duration', type=int)
parser.add_argument('gradientUsed', type=str)
parser.add_argument('gradientAmountUsed', type=float)
parser.add_argument('gradientCostPerUnit', type=float)
parser.add_argument('totalGradientCost', type=float)
parser.add_argument('quantityOut', type=float)
parser.add_argument('spoilage', type=float)
parser.add_argument('totalStockCost', type=float)

class StockTrackingListResource(Resource):
    @role_required('storekeeper', 'ceo', 'seller')
    def get(self):
        records = StockTracking.query.order_by(StockTracking.date_in.desc()).all()
        return make_response_data(data=[r.to_dict() for r in records], message="Stock tracking records fetched.")

    @role_required('storekeeper', 'ceo')
    def post(self):
        data = parser.parse_args()
        try:
            date_in = datetime.strptime(data['dateIn'], '%Y-%m-%d').date()
            date_out = datetime.strptime(data['dateOut'], '%Y-%m-%d').date() if data.get('dateOut') else None
        except ValueError:
            return make_response_data(success=False, message="Invalid date format. Use YYYY-MM-DD.", status_code=400)
        record = StockTracking(
            stock_name=data['stockName'],
            date_in=date_in,
            fruit_type=data['fruitType'],
            quantity_in=data['quantityIn'],
            amount_per_kg=data['amountPerKg'],
            total_amount=data['totalAmount'],
            other_charges=data.get('otherCharges', 0),
            date_out=date_out,
            duration=data.get('duration'),
            gradient_used=data.get('gradientUsed'),
            gradient_amount_used=data.get('gradientAmountUsed'),
            gradient_cost_per_unit=data.get('gradientCostPerUnit'),
            total_gradient_cost=data.get('totalGradientCost'),
            quantity_out=data.get('quantityOut'),
            spoilage=data.get('spoilage'),
            total_stock_cost=data.get('totalStockCost'),
        )
        db.session.add(record)
        db.session.commit()
        return make_response_data(data=record.to_dict(), message="Stock tracking record created.", status_code=201)

class ClearStockTrackingResource(Resource):
    @role_required('ceo')
    def delete(self):
        num_deleted = StockTracking.query.delete()
        db.session.commit()
        return make_response_data(message=f"Successfully cleared {num_deleted} stock tracking records.")
