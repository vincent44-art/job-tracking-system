# This is a CONCEPTUAL file showing all Store Keeper routes in one place.
# Your actual implementation uses separate files for each resource.

from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from app.models import Inventory, StockMovement, Gradient, Message, User, Role
from app.schemas import InventorySchema, StockMovementSchema, GradientSchema, MessageSchema
from app.utils.decorators import role_required
from sqlalchemy import desc

# --- From inventory.py ---

inventory_bp = Blueprint('inventory_bp', __name__)
inventory_schema = InventorySchema()
inventories_schema = InventorySchema(many=True)

@inventory_bp.route('/', methods=['GET'])
@role_required(['CEO', 'Store Keeper'])
def get_inventory():
    items = Inventory.query.all()
    return jsonify(inventories_schema.dump(items))

@inventory_bp.route('/', methods=['POST'])
@role_required('Store Keeper')
def add_inventory():
    data = request.get_json()
    data['added_by'] = get_jwt_identity()
    new_item = inventory_schema.load(data, session=db.session)
    db.session.add(new_item)
    db.session.commit()
    return jsonify(inventory_schema.dump(new_item)), 201

@inventory_bp.route('/<int:id>', methods=['PUT'])
@role_required('Store Keeper')
def update_inventory(id):
    item = Inventory.query.get_or_404(id)
    data = request.get_json()
    item.name = data.get('name', item.name)
    item.quantity = data.get('quantity', item.quantity)
    # ... other fields
    db.session.commit()
    return jsonify(inventory_schema.dump(item))

@inventory_bp.route('/<int:id>', methods=['DELETE'])
@role_required('Store Keeper')
def delete_inventory(id):
    item = Inventory.query.get_or_404(id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"msg": "Inventory item deleted successfully."})


# --- From stock_movements.py ---

stock_movements_bp = Blueprint('stock_movements_bp', __name__)
stock_movement_schema = StockMovementSchema()
stock_movements_schema = StockMovementSchema(many=True)

@stock_movements_bp.route('/', methods=['GET'])
@role_required(['CEO', 'Store Keeper'])
def get_stock_movements():
    movements = StockMovement.query.order_by(desc(StockMovement.date)).all()
    return jsonify(stock_movements_schema.dump(movements))

@stock_movements_bp.route('/', methods=['POST'])
@role_required('Store Keeper')
def add_stock_movement():
    data = request.get_json()
    data['added_by'] = get_jwt_identity()
    new_movement = stock_movement_schema.load(data, session=db.session)
    db.session.add(new_movement)
    db.session.commit()
    return jsonify(stock_movement_schema.dump(new_movement)), 201

@stock_movements_bp.route('/remaining', methods=['GET'])
@role_required(['CEO', 'Store Keeper'])
def get_remaining_stock():
    latest_movements = db.session.query(
        StockMovement.fruit_type,
        StockMovement.remaining_stock,
        StockMovement.unit
    ).distinct(StockMovement.fruit_type).order_by(StockMovement.fruit_type, desc(StockMovement.date)).all()
    
    result = { f_type: f"{rem} {unit}" for f_type, rem, unit in latest_movements }
    return jsonify(result)


# --- From gradients.py ---

gradients_bp = Blueprint('gradients_bp', __name__)
gradient_schema = GradientSchema()
gradients_schema = GradientSchema(many=True)

@gradients_bp.route('/', methods=['GET'])
@role_required(['CEO', 'Store Keeper'])
def get_gradients():
    gradients = Gradient.query.all()
    return jsonify(gradients_schema.dump(gradients))

@gradients_bp.route('/', methods=['POST'])
@role_required('Store Keeper')
def add_gradient():
    data = request.get_json()
    data['applied_by'] = get_jwt_identity()
    new_gradient = gradient_schema.load(data, session=db.session)
    db.session.add(new_gradient)
    db.session.commit()
    return jsonify(gradient_schema.dump(new_gradient)), 201


# --- From messages.py (relevant parts) ---

messages_bp = Blueprint('messages_bp', __name__)
message_schema = MessageSchema()
messages_schema = MessageSchema(many=True)

@messages_bp.route('/', methods=['GET'])
@role_required(['CEO', 'Store Keeper', 'Seller', 'Purchaser', 'Driver'])
def get_messages():
    user = User.query.get(get_jwt_identity())
    messages = Message.query.filter_by(recipient_role=user.role).order_by(Message.created_at.desc()).all()
    return jsonify(messages_schema.dump(messages))

@messages_bp.route('/<int:id>/read', methods=['PUT'])
@role_required(['CEO', 'Store Keeper', 'Seller', 'Purchaser', 'Driver'])
def mark_message_as_read(id):
    message = Message.query.get_or_404(id)
    user = User.query.get(get_jwt_identity())
    if message.recipient_role != user.role:
        return jsonify({"msg": "Unauthorized"}), 403
    message.is_read = True
    db.session.commit()
    return jsonify(message_schema.dump(message))