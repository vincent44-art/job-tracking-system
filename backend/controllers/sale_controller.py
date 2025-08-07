from flask import Blueprint, request
from datetime import datetime
from models import Sale, StockMovement
from extensions import db
from utils.auth import auth_required, role_required, get_current_user
from utils.response import success_response
from utils.error import bad_request, not_found, forbidden

bp = Blueprint('sales', __name__, url_prefix='/api/sales')

@bp.route('/', methods=['GET'])
@auth_required
@role_required('seller', 'admin', 'ceo', 'storekeeper')
def get_sales():
    sales = Sale.query.all()
    sales_data = [{
        'id': sale.id,
        'fruitType': sale.fruit_type,
        'quantity': sale.quantity,
        'unit': sale.unit,
        'pricePerUnit': sale.price_per_unit,
        'customer': sale.customer,
        'saleDate': sale.sale_date.isoformat(),
        'seller': {
            'id': sale.seller.id,
            'firstName': sale.seller.first_name,
            'lastName': sale.seller.last_name
        },
        'notes': sale.notes,
        'createdAt': sale.created_at.isoformat()
    } for sale in sales]
    return success_response(sales_data)

@bp.route('/', methods=['POST'])
@auth_required
@role_required('seller')
def create_sale():
    data = request.get_json()
    current_user = get_current_user()
    
    required_fields = ['fruit_type', 'quantity', 'unit', 'price_per_unit', 'customer', 'sale_date']
    if not all(field in data for field in required_fields):
        return bad_request('Missing required fields')
    
    try:
        sale_date = datetime.fromisoformat(data['sale_date'])
    except ValueError:
        return bad_request('Invalid date format')
    
    sale = Sale(
        fruit_type=data['fruit_type'],
        quantity=data['quantity'],
        unit=data['unit'],
        price_per_unit=data['price_per_unit'],
        customer=data['customer'],
        sale_date=sale_date,
        seller_id=current_user.id,
        notes=data.get('notes')
    )
    
    db.session.add(sale)
    
    # Create stock movement
    stock_movement = StockMovement(
        fruit_type=data['fruit_type'],
        movement_type='out',
        quantity=data['quantity'],
        unit=data['unit'],
        date=sale_date,
        reference_id=sale.id,
        reference_type='sale',
        storekeeper_id=current_user.id,
        notes=data.get('notes')
    )
    
    db.session.add(stock_movement)
    db.session.commit()
    
    return success_response({
        'id': sale.id,
        'fruitType': sale.fruit_type,
        'quantity': sale.quantity,
        'unit': sale.unit,
        'pricePerUnit': sale.price_per_unit,
        'customer': sale.customer,
        'saleDate': sale.sale_date.isoformat(),
        'sellerId': sale.seller_id,
        'notes': sale.notes
    }, status_code=201)

@bp.route('/<int:sale_id>', methods=['DELETE'])
@auth_required
@role_required('seller', 'admin')
def delete_sale(sale_id):
    current_user = get_current_user()
    sale = Sale.query.get(sale_id)
    
    if not sale:
        return not_found('Sale not found')
    
    if sale.seller_id != current_user.id and current_user.role != 'admin':
        return forbidden('Not authorized to delete this sale')
    
    # Delete associated stock movement
    StockMovement.query.filter_by(reference_id=sale.id, reference_type='sale').delete()
    
    db.session.delete(sale)
    db.session.commit()
    
    return success_response({}, message='Sale deleted successfully')