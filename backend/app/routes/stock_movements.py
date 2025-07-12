from flask import Blueprint, request, jsonify
from app import db
from app.models.stock_movement import StockMovement
from app.schemas.stock_movement_schema import StockMovementSchema
from app.utils.decorators import role_required
from flask_jwt_extended import jwt_required, get_jwt_identity

stock_movements_bp = Blueprint('stock_movements_bp', __name__)
stock_movement_schema = StockMovementSchema()
stock_movements_schema = StockMovementSchema(many=True)

@stock_movements_bp.route('/', methods=['GET'])
@jwt_required()
@role_required(['CEO', 'Store Keeper'])
def get_stock_movements():
    """Get all stock movement history."""
    movements = StockMovement.query.order_by(StockMovement.date.desc()).all()
    return jsonify(stock_movements_schema.dump(movements))

@stock_movements_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('Store Keeper')
def record_stock_movement():
    """Record a new stock movement (in/out)."""
    data = request.get_json()
    user_id = get_jwt_identity()

    # Here you would add logic to calculate remaining_stock
    # This is a simplified example. A real-world app would query the inventory.
    # For now, we'll just store what's provided or a placeholder.
    remaining_stock_value = data.get('remaining_stock', 'Not Calculated')

    try:
        new_movement = stock_movement_schema.load(data, session=db.session)
        new_movement.added_by = user_id
        new_movement.remaining_stock = remaining_stock_value # Set the calculated value
        db.session.add(new_movement)
        db.session.commit()
        return jsonify(stock_movement_schema.dump(new_movement)), 201
    except Exception as e:
        return jsonify({"msg": "Error recording movement", "error": str(e)}), 400

@stock_movements_bp.route('/clear', methods=['DELETE'])
@jwt_required()
@role_required('CEO')
def clear_movements():
    """Clear all stock movement history."""
    try:
        num_rows_deleted = db.session.query(StockMovement).delete()
        db.session.commit()
        return jsonify({"msg": f"Successfully cleared {num_rows_deleted} stock movements."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Failed to clear movements", "error": str(e)}), 500

# The /remaining endpoint is more of a reporting function,
# so the logic might be better placed in the reports blueprint
# or require a more complex calculation based on the inventory table.
# This is a placeholder for that concept.
@stock_movements_bp.route('/remaining', methods=['GET'])
@jwt_required()
@role_required(['CEO', 'Store Keeper'])
def get_remaining_stock():
    """Calculate remaining stock for a fruit type."""
    fruit_type = request.args.get('fruit_type')
    if not fruit_type:
        return jsonify({"msg": "fruit_type query parameter is required"}), 400
    # A real implementation would sum up 'in' and 'out' movements
    # or directly query the main inventory table.
    return jsonify({"msg": f"Calculation for remaining stock of {fruit_type} not yet implemented."})