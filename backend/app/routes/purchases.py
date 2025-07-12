from flask import Blueprint, request, jsonify
from app import db
from app.models.purchase import Purchase
from app.models.user import UserRole
from app.schemas.purchase_schema import PurchaseSchema
from app.utils.decorators import role_required
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

purchases_bp = Blueprint('purchases_bp', __name__)
purchase_schema = PurchaseSchema()
purchases_schema = PurchaseSchema(many=True)

@purchases_bp.route('/', methods=['GET'])
@jwt_required()
@role_required(['CEO', 'Purchaser'])
def get_purchases():
    """Get purchase history, filtered by user if they are a Purchaser."""
    user_id = get_jwt_identity()
    user_role = get_jwt()['role']

    query = Purchase.query

    if user_role == UserRole.PURCHASER.value:
        query = query.filter_by(purchaser_id=user_id)
    
    purchases = query.order_by(Purchase.purchase_date.desc()).all()
    return jsonify(purchases_schema.dump(purchases))

@purchases_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('Purchaser')
def record_purchase():
    """Record a new purchase."""
    data = request.get_json()
    user_id = get_jwt_identity()
    try:
        new_purchase = purchase_schema.load(data, session=db.session)
        new_purchase.purchaser_id = user_id
        db.session.add(new_purchase)
        db.session.commit()
        return jsonify(purchase_schema.dump(new_purchase)), 201
    except Exception as e:
        return jsonify({"msg": "Error recording purchase", "error": str(e)}), 400

@purchases_bp.route('/clear', methods=['DELETE'])
@jwt_required()
@role_required('CEO')
def clear_purchases():
    """Clear all purchase history."""
    try:
        num_rows_deleted = db.session.query(Purchase).delete()
        db.session.commit()
        return jsonify({"msg": f"Successfully cleared {num_rows_deleted} purchase records."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Failed to clear purchases", "error": str(e)}), 500