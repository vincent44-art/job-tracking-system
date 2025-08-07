from flask_restful import Resource, reqparse
from datetime import datetime
from sqlalchemy import func
from models import db, Purchase, UserRole
from utils.helpers import make_response_data, get_current_user
from utils.decorators import role_required

parser = reqparse.RequestParser()
parser.add_argument('supplier_name', type=str, required=True)
parser.add_argument('fruit_type', type=str, required=True)
parser.add_argument('quantity', type=str, required=True)
parser.add_argument('cost', type=float, required=True)
parser.add_argument('purchase_date', type=str, required=True)

class PurchaseListResource(Resource):
    @role_required('ceo', 'purchaser')
    def get(self):
        current_user = get_current_user()
        
        if current_user.role == UserRole.CEO:
            purchases = Purchase.query.order_by(Purchase.purchase_date.desc()).all()
        else: # Purchaser
            purchases = Purchase.query.filter_by(purchaser_id=current_user.id).order_by(Purchase.purchase_date.desc()).all()
            
        return make_response_data(data=[p.to_dict() for p in purchases], message="Purchases fetched.")

    @role_required('purchaser')
    def post(self):
        data = parser.parse_args()
        current_user = get_current_user()

        try:
            purchase_date = datetime.strptime(data['purchase_date'], '%Y-%m-%d').date()
        except ValueError:
            return make_response_data(success=False, message="Invalid date format for purchase_date. Use YYYY-MM-DD.", status_code=400)

        new_purchase = Purchase(
            purchaser_id=current_user.id,
            supplier_name=data['supplier_name'],
            fruit_type=data['fruit_type'],
            quantity=data['quantity'],
            cost=data['cost'],
            purchase_date=purchase_date
        )
        db.session.add(new_purchase)
        db.session.commit()
        return make_response_data(data=new_purchase.to_dict(), message="Purchase recorded.", status_code=201)

class PurchaseResource(Resource):
    @role_required('ceo')
    def put(self, purchase_id):
        purchase = Purchase.query.get_or_404(purchase_id)
        data = parser.parse_args()
        
        purchase.supplier_name = data['supplier_name']
        purchase.fruit_type = data['fruit_type']
        purchase.quantity = data['quantity']
        purchase.cost = data['cost']
        purchase.purchase_date = datetime.strptime(data['purchase_date'], '%Y-%m-%d').date()
        
        db.session.commit()
        return make_response_data(data=purchase.to_dict(), message="Purchase record updated.")

    @role_required('ceo')
    def delete(self, purchase_id):
        purchase = Purchase.query.get_or_404(purchase_id)
        db.session.delete(purchase)
        db.session.commit()
        return make_response_data(message="Purchase record deleted.")

class ClearPurchasesResource(Resource):
    @role_required('ceo')
    def delete(self):
        num_deleted = Purchase.query.delete()
        db.session.commit()
        return make_response_data(message=f"Successfully cleared {num_deleted} purchase records.")

class PurchaseSummaryResource(Resource):
    @role_required('ceo')
    def get(self):
        total_cost = db.session.query(func.sum(Purchase.cost)).scalar() or 0
        cost_by_fruit = db.session.query(Purchase.fruit_type, func.sum(Purchase.cost)).group_by(Purchase.fruit_type).all()
        
        summary = {
            'total_cost': total_cost,
            'cost_by_fruit': [{'fruit_type': fruit, 'total_cost': cost} for fruit, cost in cost_by_fruit]
        }
        return make_response_data(data=summary, message="Purchase summary fetched.")