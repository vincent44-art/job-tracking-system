from flask import Blueprint, request
from datetime import datetime
from models import Purchase, StockMovement
from extensions import db
from utils.auth import auth_required, role_required, get_current_user
from utils.response import success_response
from utils.error import bad_request, not_found, forbidden

bp = Blueprint('purchases', __name__, url_prefix='/api/purchases')

@bp.route('/', methods=['GET'])
@auth_required
@role_required('purchaser', 'admin', 'ceo', 'storekeeper')
def get_purchases():
    purchases = Purchase.query.all()
    purchases_data = [{
        'id': purchase.id,
        'fruitType': purchase.fruit_type,
        'quantity': purchase.quantity,
        'unit': purchase.unit,
        'pricePerUnit': purchase.price_per_unit,
        'supplier': purchase.supplier,
        'purchaseDate': purchase.purchase_date.isoformat(),
        'purchaser': {
            'id': purchase.purchaser.id,
            'firstName': purchase.purchaser.first_name,
            'lastName': purchase.purchaser.last_name
        },
        'notes': purchase.notes,
        'createdAt': purchase.created_at.isoformat()
    } for purchase in purchases]
    return success_response(purchases_data)

@bp.route('/', methods=['POST'])
@auth_required
@role_required('purchaser')
def create_purchase():
    data = request.get_json()
    current_user = get_current_user()
    
    required_fields = ['fruit_type', 'quantity', 'unit', 'price_per_unit', 'supplier', 'purchase_date']
    if not all(field in data for field in required_fields):
        return bad_request('Missing required fields')
    
    try:
        purchase_date = datetime.fromisoformat(data['purchase_date'])
    except ValueError:
        return bad_request('Invalid date format')
    
    purchase = Purchase(
        fruit_type=data['fruit_type'],
        quantity=data['quantity'],
        unit=data['unit'],
        price_per_unit=data['price_per_unit'],
        supplier=data['supplier'],
        purchase_date=purchase_date,
        purchaser_id=current_user.id,
        notes=data.get('notes')
    )
    
    db.session.add(purchase)
    
    # Create stock movement
    stock_movement = StockMovement(
        fruit_type=data['fruit_type'],
        movement_type='in',
        quantity=data['quantity'],
        unit=data['unit'],
        date=purchase_date,
        reference_id=purchase.id,
        reference_type='purchase',
        storekeeper_id=current_user.id,
        notes=data.get('notes')
    )
    
    db.session.add(stock_movement)
    db.session.commit()
    
    return success_response({
        'id': purchase.id,
        'fruitType': purchase.fruit_type,
        'quantity': purchase.quantity,
        'unit': purchase.unit,
        'pricePerUnit': purchase.price_per_unit,
        'supplier': purchase.supplier,
        'purchaseDate': purchase.purchase_date.isoformat(),
        'purchaserId': purchase.purchaser_id,
        'notes': purchase.notes
    }, status_code=201)

@bp.route('/<int:purchase_id>', methods=['DELETE'])
@auth_required
@role_required('purchaser', 'admin')
def delete_purchase(purchase_id):
    current_user = get_current_user()
    purchase = Purchase.query.get(purchase_id)
    
    if not purchase:
        return not_found('Purchase not found')
    
    if purchase.purchaser_id != current_user.id and current_user.role != 'admin':
        return forbidden('Not authorized to delete this purchase')
    
    # Delete associated stock movement
    StockMovement.query.filter_by(reference_id=purchase.id, reference_type='purchase').delete()
    
    db.session.delete(purchase)
    db.session.commit()
    
    return success_response({}, message='Purchase deleted successfully')