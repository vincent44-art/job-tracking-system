from flask_restful import Resource, reqparse
from datetime import datetime
from sqlalchemy import func
from models import db, Sale, UserRole
from utils.helpers import make_response_data, get_current_user
from utils.decorators import role_required

parser = reqparse.RequestParser()
parser.add_argument('assignment', type=str, required=True)
parser.add_argument('fruit_type', type=str, required=True)
parser.add_argument('quantity', type=str, required=True)
parser.add_argument('revenue', type=float, required=True)
parser.add_argument('sale_date', type=str, required=True)

class SalesListResource(Resource):
    @role_required('ceo', 'seller')
    def get(self):
        current_user = get_current_user()
        
        if current_user.role == UserRole.CEO:
            sales = Sale.query.order_by(Sale.sale_date.desc()).all()
        else: # Seller
            sales = Sale.query.filter_by(seller_id=current_user.id).order_by(Sale.sale_date.desc()).all()
            
        return make_response_data(data=[sale.to_dict() for sale in sales], message="Sales fetched successfully.")

    @role_required('seller')
    def post(self):
        data = parser.parse_args()
        current_user = get_current_user()

        try:
            sale_date = datetime.strptime(data['sale_date'], '%Y-%m-%d').date()
        except ValueError:
            return make_response_data(success=False, message="Invalid date format for sale_date. Use YYYY-MM-DD.", status_code=400)

        new_sale = Sale(
            seller_id=current_user.id,
            assignment=data['assignment'],
            fruit_type=data['fruit_type'],
            quantity=data['quantity'],
            revenue=data['revenue'],
            sale_date=sale_date
        )
        db.session.add(new_sale)
        db.session.commit()
        return make_response_data(data=new_sale.to_dict(), message="Sale recorded successfully.", status_code=201)

class SalesResource(Resource):
    @role_required('ceo') # Only CEO can edit/delete sales records
    def put(self, sale_id):
        sale = Sale.query.get_or_404(sale_id)
        data = parser.parse_args()
        
        sale.assignment = data['assignment']
        sale.fruit_type = data['fruit_type']
        sale.quantity = data['quantity']
        sale.revenue = data['revenue']
        sale.sale_date = datetime.strptime(data['sale_date'], '%Y-%m-%d').date()
        
        db.session.commit()
        return make_response_data(data=sale.to_dict(), message="Sale record updated.")

    @role_required('ceo')
    def delete(self, sale_id):
        sale = Sale.query.get_or_404(sale_id)
        db.session.delete(sale)
        db.session.commit()
        return make_response_data(message="Sale record deleted.")

class ClearSalesResource(Resource):
    @role_required('ceo')
    def delete(self):
        num_deleted = Sale.query.delete()
        db.session.commit()
        return make_response_data(message=f"Successfully cleared {num_deleted} sales records.")

class SalesSummaryResource(Resource):
    @role_required('ceo')
    def get(self):
        total_revenue = db.session.query(func.sum(Sale.revenue)).scalar() or 0
        sales_by_fruit = db.session.query(Sale.fruit_type, func.sum(Sale.revenue)).group_by(Sale.fruit_type).all()
        
        summary = {
            'total_revenue': total_revenue,
            'revenue_by_fruit': [{'fruit_type': fruit, 'total_revenue': revenue} for fruit, revenue in sales_by_fruit]
        }
        return make_response_data(data=summary, message="Sales summary fetched.")