from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from models import User
from utils.error import unauthorized, forbidden

def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        return fn(*args, **kwargs)
    return wrapper

def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims['role'] not in roles:
                return forbidden('Insufficient permissions')
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(user_id)