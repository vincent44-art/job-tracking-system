from flask import Blueprint, request
from datetime import datetime
from models import Inventory, StockMovement
from extensions import db
from utils.auth import auth_required, role_required, get_current_user
from utils.response import success_response
from utils.error import bad_request, not_found, forbidden

bp = Blueprint('inventory', __name__, url_prefix='/api/inventory')

@bp.route('/', methods=['GET'])
@auth_required
@role_required('storekeeper', 'admin', 'ceo', 'purchaser', 'seller')
def get_inventory():
    inventory_items = Inventory.query.all()
    inventory_data = [{
        'id': item.id,
        'fruitType': item.fruit_type,
        'quantity': item.quantity,
        'unit': item.unit,
        'purchasePrice': item.purchase_price,
        'sellingPrice': item.selling_price,
        'supplier': item.supplier,
        'lastUpdated': item.last_updated.isoformat(),
        'storekeeper': {
            'id': item.storekeeper.id,
            'firstName': item.storekeeper.first_name,
            'lastName': item.storekeeper.last_name
        },
        'notes': item.notes
    } for item in inventory_items]
    return success_response(inventory_data)

@bp.route('/', methods=['POST'])
@auth_required
@role_required('storekeeper')
def create_inventory():
    data = request.get_json()
    current_user = get_current_user()
    
    required_fields = ['fruit_type', 'quantity', 'unit', 'purchase_price', 'selling_price', 'supplier']
    if not all(field in data for field in required_fields):
        return bad_request('Missing required fields')
    
    inventory = Inventory(
        fruit_type=data['fruit_type'],
        quantity=data['quantity'],
        unit=data['unit'],
        purchase_price=data['purchase_price'],
        selling_price=data['selling_price'],
        supplier=data['supplier'],
        storekeeper_id=current_user.id,
        notes=data.get('notes')
    )
    
    db.session.add(inventory)
    db.session.commit()
    
    return success_response({
        'id': inventory.id,
        'fruitType': inventory.fruit_type,
        'quantity': inventory.quantity,
        'unit': inventory.unit,
        'purchasePrice': inventory.purchase_price,
        'sellingPrice': inventory.selling_price,
        'supplier': inventory.supplier,
        'storekeeperId': inventory.storekeeper_id,
        'notes': inventory.notes
    }, status_code=201)

@bp.route('/<int:inventory_id>', methods=['DELETE'])
@auth_required
@role_required('storekeeper', 'admin')
def delete_inventory(inventory_id):
    current_user = get_current_user()
    inventory = Inventory.query.get(inventory_id)
    
    if not inventory:
        return not_found('Inventory item not found')
    
    if inventory.storekeeper_id != current_user.id and current_user.role != 'admin':
        return forbidden('Not authorized to delete this inventory item')
    
    db.session.delete(inventory)
    db.session.commit()
    
    return success_response({}, message='Inventory item deleted successfully')

@bp.route('/stock-movements', methods=['GET'])
@auth_required
@role_required('storekeeper', 'admin', 'ceo')
def get_stock_movements():
    movements = StockMovement.query.all()
    movements_data = [{
        'id': movement.id,
        'fruitType': movement.fruit_type,
        'movementType': movement.movement_type,
        'quantity': movement.quantity,
        'unit': movement.unit,
        'date': movement.date.isoformat(),
        'referenceId': movement.reference_id,
        'referenceType': movement.reference_type,
        'storekeeper': {
            'id': movement.storekeeper.id,
            'firstName': movement.storekeeper.first_name,
            'lastName': movement.storekeeper.last_name
        },
        'notes': movement.notes
    } for movement in movements]
    return success_response(movements_data)