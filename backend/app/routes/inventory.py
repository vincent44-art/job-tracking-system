from flask import Blueprint, request, jsonify
from app import db
from app.models.inventory import Inventory
from app.schemas.inventory_schema import InventorySchema
from app.utils.decorators import role_required
from flask_jwt_extended import jwt_required, get_jwt_identity

inventory_bp = Blueprint('inventory_bp', __name__)
inventory_schema = InventorySchema()
inventories_schema = InventorySchema(many=True)

@inventory_bp.route('/', methods=['GET'])
@jwt_required()
@role_required(['CEO', 'Store Keeper'])
def get_inventory():
    items = Inventory.query.all()
    return jsonify(inventories_schema.dump(items))

@inventory_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('Store Keeper')
def add_inventory():
    data = request.get_json()
    user_id = get_jwt_identity()
    try:
        new_item = inventory_schema.load(data, session=db.session)
        new_item.added_by = user_id
        db.session.add(new_item)
        db.session.commit()
        return jsonify(inventory_schema.dump(new_item)), 201
    except Exception as e:
        return jsonify({"msg": "Error adding item", "error": str(e)}), 400

@inventory_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@role_required('Store Keeper')
def update_inventory(id):
    item = Inventory.query.get_or_404(id)
    data = request.get_json()
    for key, value in data.items():
        setattr(item, key, value)
    db.session.commit()
    return jsonify(inventory_schema.dump(item))
    
@inventory_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('Store Keeper')
def delete_inventory_item(id):
    item = Inventory.query.get_or_404(id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"msg": "Inventory item deleted"})


@inventory_bp.route('/clear', methods=['DELETE'])
@jwt_required()
@role_required('CEO')
def clear_inventory():
    try:
        num_rows_deleted = db.session.query(Inventory).delete()
        db.session.commit()
        return jsonify({"msg": f"Successfully cleared {num_rows_deleted} inventory items."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Failed to clear inventory", "error": str(e)}), 500