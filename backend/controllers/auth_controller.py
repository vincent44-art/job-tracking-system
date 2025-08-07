from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User
from utils.auth import get_current_user
from utils.response import success_response
from utils.error import bad_request, unauthorized

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return bad_request('Email and password are required')
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.verify_password(password):
        return unauthorized('Invalid credentials')
    
    access_token = create_access_token(identity=user.id, additional_claims={'role': user.role})
    
    return success_response({
        'token': access_token,
        'user': {
            'id': user.id,
            'firstName': user.first_name,
            'lastName': user.last_name,
            'email': user.email,
            'role': user.role
        }
    })

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user = get_current_user()
    return success_response({
        'id': user.id,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'email': user.email,
        'role': user.role,
        'phone': user.phone
    })

@bp.route('/refresh', methods=['POST'])
@jwt_required()
def refresh_token():
    user = get_current_user()
    access_token = create_access_token(identity=user.id, additional_claims={'role': user.role})
    return success_response({'token': access_token})