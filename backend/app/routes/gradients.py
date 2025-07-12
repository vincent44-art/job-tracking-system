from flask import Blueprint, request, jsonify
from app import db
from app.models.gradient import Gradient
from app.schemas.gradient_schema import GradientSchema
from app.utils.decorators import role_required
from flask_jwt_extended import jwt_required, get_jwt_identity

gradients_bp = Blueprint('gradients_bp', __name__)
gradient_schema = GradientSchema()
gradients_schema = GradientSchema(many=True)

@gradients_bp.route('/', methods=['GET'])
@jwt_required()
@role_required(['CEO', 'Store Keeper'])
def get_gradients():
    """Get all gradient application records."""
    gradients = Gradient.query.order_by(Gradient.application_date.desc()).all()
    return jsonify(gradients_schema.dump(gradients))

@gradients_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('Store Keeper')
def apply_gradient():
    """Record a new gradient treatment."""
    data = request.get_json()
    user_id = get_jwt_identity()
    try:
        new_gradient = gradient_schema.load(data, session=db.session)
        new_gradient.applied_by = user_id
        db.session.add(new_gradient)
        db.session.commit()
        return jsonify(gradient_schema.dump(new_gradient)), 201
    except Exception as e:
        return jsonify({"msg": "Error recording gradient application", "error": str(e)}), 400

@gradients_bp.route('/clear', methods=['DELETE'])
@jwt_required()
@role_required('CEO')
def clear_gradients():
    """Clear all gradient data."""
    try:
        num_rows_deleted = db.session.query(Gradient).delete()
        db.session.commit()
        return jsonify({"msg": f"Successfully cleared {num_rows_deleted} gradient records."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Failed to clear gradients", "error": str(e)}), 500