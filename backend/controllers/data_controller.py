from flask import Blueprint
from models import (
    Purchase, Sale, Inventory, StockMovement,
    Salary, SalaryPayment, CarExpense, OtherExpense
)
from extensions import db
from utils.auth import auth_required, role_required
from utils.response import success_response

bp = Blueprint('data', __name__, url_prefix='/api/data')

@bp.route('/clear-all', methods=['DELETE'])
@auth_required
@role_required('admin')
def clear_all_data():
    # Clear all data in the correct order to avoid foreign key constraints
    SalaryPayment.query.delete()
    Salary.query.delete()
    StockMovement.query.delete()
    Sale.query.delete()
    Purchase.query.delete()
    Inventory.query.delete()
    CarExpense.query.delete()
    OtherExpense.query.delete()
    
    db.session.commit()
    
    return success_response({}, message='All data cleared successfully')

@bp.route('/clear-purchases', methods=['DELETE'])
@auth_required
@role_required('admin')
def clear_purchases():
    # First delete stock movements related to purchases
    StockMovement.query.filter_by(reference_type='purchase').delete()
    Purchase.query.delete()
    db.session.commit()
    
    return success_response({}, message='Purchase data cleared successfully')

@bp.route('/clear-sales', methods=['DELETE'])
@auth_required
@role_required('admin')
def clear_sales():
    # First delete stock movements related to sales
    StockMovement.query.filter_by(reference_type='sale').delete()
    Sale.query.delete()
    db.session.commit()
    
    return success_response({}, message='Sale data cleared successfully')

@bp.route('/clear-inventory', methods=['DELETE'])
@auth_required
@role_required('admin')
def clear_inventory():
    Inventory.query.delete()
    db.session.commit()
    
    return success_response({}, message='Inventory data cleared successfully')

@bp.route('/clear-car-expenses', methods=['DELETE'])
@auth_required
@role_required('admin')
def clear_car_expenses():
    CarExpense.query.delete()
    db.session.commit()
    
    return success_response({}, message='Car expense data cleared successfully')

@bp.route('/clear-other-expenses', methods=['DELETE'])
@auth_required
@role_required('admin')
def clear_other_expenses():
    OtherExpense.query.delete()
    db.session.commit()
    
    return success_response({}, message='Other expense data cleared successfully')

@bp.route('/clear-salaries', methods=['DELETE'])
@auth_required
@role_required('admin')
def clear_salaries():
    SalaryPayment.query.delete()
    Salary.query.delete()
    db.session.commit()
    
    return success_response({}, message='Salary data cleared successfully')