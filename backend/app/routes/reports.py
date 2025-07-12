from flask import Blueprint, jsonify
from sqlalchemy import func, case
from app import db
from app.models.sale import Sale
from app.models.purchase import Purchase
from app.models.expense import Expense
from app.models.inventory import Inventory
from app.models.user import User
from app.utils.decorators import role_required
from flask_jwt_extended import jwt_required

reports_bp = Blueprint('reports_bp', __name__)

@reports_bp.route('/overview', methods=['GET'])
@jwt_required()
@role_required('CEO')
def financial_overview():
    """Provides a high-level financial overview."""
    total_revenue = db.session.query(func.sum(Sale.revenue)).scalar() or 0.0
    total_cost = db.session.query(func.sum(Purchase.cost)).scalar() or 0.0
    total_expenses = db.session.query(func.sum(Expense.amount)).scalar() or 0.0
    
    gross_profit = total_revenue - total_cost
    net_profit = gross_profit - total_expenses
    
    return jsonify({
        "total_revenue": f"{total_revenue:,.2f}",
        "total_purchase_cost": f"{total_cost:,.2f}",
        "gross_profit": f"{gross_profit:,.2f}",
        "total_operational_expenses": f"{total_expenses:,.2f}",
        "net_profit": f"{net_profit:,.2f}",
        "currency": "KES"
    })

@reports_bp.route('/inventory-summary', methods=['GET'])
@jwt_required()
@role_required('CEO')
def inventory_summary():
    """Provides a summary of inventory by fruit type."""
    # Note: Since quantity is a string, we can't SUM() it directly in SQL.
    # We group by fruit type and count the items.
    summary = db.session.query(
        Inventory.fruit_type,
        func.count(Inventory.id).label('item_count')
    ).group_by(Inventory.fruit_type).all()

    # A more advanced version would parse the string quantity to do a proper sum.
    # For now, we return the count of distinct entries per fruit.
    
    return jsonify([{"fruit_type": s.fruit_type, "item_count": s.item_count} for s in summary])

@reports_bp.route('/sales-summary', methods=['GET'])
@jwt_required()
@role_required('CEO')
def sales_summary():
    """Provides a sales summary grouped by seller."""
    summary = db.session.query(
        User.name.label('seller_name'),
        func.sum(Sale.revenue).label('total_revenue'),
        func.count(Sale.id).label('total_sales')
    ).join(User, Sale.seller_id == User.id).group_by(User.name).all()
    
    return jsonify([{
        "seller_name": s.seller_name, 
        "total_revenue": f"{s.total_revenue:,.2f}",
        "total_sales": s.total_sales
    } for s in summary])

@reports_bp.route('/expenses-summary', methods=['GET'])
@jwt_required()
@role_required('CEO')
def expenses_summary():
    """Provides an expenses summary grouped by type."""
    summary = db.session.query(
        Expense.expense_type,
        func.sum(Expense.amount).label('total_amount')
    ).group_by(Expense.expense_type).all()
    
    return jsonify([{
        "expense_type": s.expense_type, 
        "total_amount": f"{s.total_amount:,.2f}"
    } for s in summary])