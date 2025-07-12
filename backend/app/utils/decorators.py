from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request
from app.models.user import UserRole

def role_required(required_roles):
    """
    A decorator to protect routes based on user roles.
    `required_roles` can be a single role string or a list of role strings.
    Example: @role_required('CEO') or @role_required(['CEO', 'Store Keeper'])
    """
    if isinstance(required_roles, str):
        required_roles = [required_roles]

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get('role')

            if user_role not in required_roles:
                return jsonify({"msg": "Access forbidden: insufficient permissions"}), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator