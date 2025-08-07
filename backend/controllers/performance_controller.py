from flask import Blueprint
from models import Sale, Purchase
from extensions import db
from sqlalchemy import func, extract
from datetime import datetime
from utils.auth import auth_required, role_required
from utils.response import success_response

bp = Blueprint('performance', __name__, url_prefix='/api/performance')

@bp.route('/stats', methods=['GET'])
@auth_required
@role_required('ceo', 'admin')
def get_company_stats():
    # Total sales
    total_sales = db.session.query(func.sum(Sale.quantity * Sale.price_per_unit)).scalar() or 0
    
    # Total purchases
    total_purchases = db.session.query(func.sum(Purchase.quantity * Purchase.price_per_unit)).scalar() or 0
    
    # Net profit
    net_profit = total_sales - total_purchases
    
    return success_response({
        'totalSales': total_sales,
        'totalPurchases': total_purchases,
        'netProfit': net_profit
    })

@bp.route('/fruit', methods=['GET'])
@auth_required
@role_required('ceo', 'admin', 'seller', 'purchaser')
def get_fruit_performance():
    # Sales by fruit type
    sales_by_fruit = db.session.query(
        Sale.fruit_type,
        func.sum(Sale.quantity).label('total_quantity'),
        func.sum(Sale.quantity * Sale.price_per_unit).label('total_revenue')
    ).group_by(Sale.fruit_type).all()
    
    # Purchases by fruit type
    purchases_by_fruit = db.session.query(
        Purchase.fruit_type,
        func.sum(Purchase.quantity).label('total_quantity'),
        func.sum(Purchase.quantity * Purchase.price_per_unit).label('total_cost')
    ).group_by(Purchase.fruit_type).all()
    
    # Combine data
    fruit_performance = []
    for sale in sales_by_fruit:
        purchase = next((p for p in purchases_by_fruit if p.fruit_type == sale.fruit_type), None)
        profit = sale.total_revenue - (purchase.total_cost if purchase else 0)
        
        fruit_performance.append({
            'fruitType': sale.fruit_type,
            'totalSalesQuantity': sale.total_quantity,
            'totalSalesRevenue': sale.total_revenue,
            'totalPurchaseQuantity': purchase.total_quantity if purchase else 0,
            'totalPurchaseCost': purchase.total_cost if purchase else 0,
            'profit': profit
        })
    
    return success_response(fruit_performance)

@bp.route('/monthly', methods=['GET'])
@auth_required
@role_required('ceo', 'admin')
def get_monthly_performance():
    # Current year
    current_year = datetime.now().year
    
    # Monthly sales
    monthly_sales = db.session.query(
        extract('month', Sale.sale_date).label('month'),
        func.sum(Sale.quantity * Sale.price_per_unit).label('total_sales')
    ).filter(extract('year', Sale.sale_date) == current_year
    ).group_by('month').order_by('month').all()
    
    # Monthly purchases
    monthly_purchases = db.session.query(
        extract('month', Purchase.purchase_date).label('month'),
        func.sum(Purchase.quantity * Purchase.price_per_unit).label('total_purchases')
    ).filter(extract('year', Purchase.purchase_date) == current_year
    ).group_by('month').order_by('month').all()
    
    # Combine data
    monthly_data = []
    for month in range(1, 13):
        sales = next((ms for ms in monthly_sales if ms.month == month), None)
        purchases = next((mp for mp in monthly_purchases if mp.month == month), None)
        
        monthly_data.append({
            'month': month,
            'totalSales': sales.total_sales if sales else 0,
            'totalPurchases': purchases.total_purchases if purchases else 0,
            'profit': (sales.total_sales if sales else 0) - (purchases.total_purchases if purchases else 0)
        })
    
    return success_response(monthly_data)