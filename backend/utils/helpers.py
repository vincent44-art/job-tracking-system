from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from models.user import User

def make_response_data(data=None, success=True, message="", errors=None, status_code=200):
    """Standardized API response format."""
    response = {
        "success": success,
        "message": message,
        "data": data or {},
        "errors": errors or []
    }
    return jsonify(response), status_code

def get_current_user():
    """Helper to get the full User object from JWT identity."""
    user_id = get_jwt_identity()
    return User.query.get(user_id)