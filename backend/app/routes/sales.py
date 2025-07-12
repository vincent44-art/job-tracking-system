from flask import Blueprint, request, jsonify
from app import db
from app.models.sale import Sale
from app.models.user import User, UserRole
from app.schemas.sale_schema import SaleSchema
from app.utils.decorators import role_required
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from sqlalchemy import func

# Create the blueprint
sales_bp = Blueprint('sales_bp', __name__)

# Instantiate schemas
sale_schema = SaleSchema()
sales_schema = SaleSchema(many=True)

@sales_bp.route('/', methods=['GET'])
@jwt_required()
@role_required(['CEO', 'Seller'])
def get_sales():
    """
    Get sales records.
    - If the user is a CEO, they see all sales.
    - If the user is a Seller, they only see their own sales.
    """
    user_id = get_jwt_identity()
    claims = get_jwt()
    user_role = claims.get('role')

    query = Sale.query

    # Filter the query based on the user's role
    if user_role == UserRole.SELLER.value:
        query = query.filter_by(seller_id=user_id)

    # Order by most recent sales first
    sales = query.order_by(Sale.date.desc()).all()
    
    return jsonify(sales_schema.dump(sales))

@sales_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('Seller')
def record_sale():
    """
    Record a new sale. This endpoint is only accessible to users with the 'Seller' role.
    """
    data = request.get_json()
    seller_id = get_jwt_identity()

    try:
        # Load and validate the incoming data using the schema
        new_sale = sale_schema.load(data, session=db.session)
        
        # Set the seller_id from the JWT token identity
        new_sale.seller_id = seller_id
        
        # Add to the database and commit
        db.session.add(new_sale)
        db.session.commit()
        
        # Return the newly created sale object with a 201 Created status
        return jsonify(sale_schema.dump(new_sale)), 201
    except Exception as e:
        # Handle potential validation errors or other exceptions
        db.session.rollback()
        return jsonify({"msg": "Error recording sale", "error": str(e)}), 400

@sales_bp.route('/clear', methods=['DELETE'])
@jwt_required()
@role_required('CEO')
def clear_sales():
    """
    Clear all sales data from the database. This is a high-privilege action
    restricted to the CEO.
    """
    try:
        # Perform a bulk delete for efficiency
        num_rows_deleted = db.session.query(Sale).delete()
        db.session.commit()
        return jsonify({"msg": f"Successfully cleared {num_rows_deleted} sales records."})
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Failed to clear sales data", "error": str(e)}), 500

@sales_bp.route('/summary', methods=['GET'])
@jwt_required()
@role_required('CEO')
def get_sales_summary():
    """
    Get a sales summary report, grouped by seller. Restricted to the CEO.
    """
    summary = db.session.query(
        User.name.label('seller_name'),
        func.sum(Sale.revenue).label('total_revenue'),
        func.count(Sale.id).label('number_of_sales')
    ).join(User, Sale.seller_id == User.id).group_by(User.name).order_by(func.sum(Sale.revenue).desc()).all()

    # Format the result into a clean list of dictionaries
    result = [
        {
            "seller_name": s.seller_name,
            "total_revenue": f"{s.total_revenue:,.2f}", # Format currency with commas
            "number_of_sales": s.number_of_sales,
            "currency": "KES"
        } 
        for s in summary
    ]

    return jsonify(result)