from flask import Blueprint, request
from models import User
from extensions import db
from utils.auth import auth_required, role_required, get_current_user
from utils.response import success_response
from utils.error import bad_request, not_found

bp = Blueprint('users', __name__, url_prefix='/api/users')

@bp.route('/', methods=['GET'])
@auth_required
@role_required('admin', 'ceo')
def get_users():
    users = User.query.all()
    users_data = [{
        'id': user.id,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'email': user.email,
        'role': user.role,
        'phone': user.phone
    } for user in users]
    return success_response(users_data)

@bp.route('/', methods=['POST'])
@auth_required
@role_required('admin')
def create_user():
    data = request.get_json()
    
    if not all(key in data for key in ['first_name', 'last_name', 'email', 'password', 'role', 'phone']):
        return bad_request('Missing required fields')
    
    if User.query.filter_by(email=data['email']).first():
        return bad_request('Email already exists')
    
    user = User(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        role=data['role'],
        phone=data['phone']
    )
    user.password = data['password']
    
    db.session.add(user)
    db.session.commit()
    
    return success_response({
        'id': user.id,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'email': user.email,
        'role': user.role
    }, status_code=201)

@bp.route('/<int:user_id>', methods=['PUT'])
@auth_required
@role_required('admin')
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return not_found('User not found')
    
    data = request.get_json()
    
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first():
            return bad_request('Email already exists')
        user.email = data['email']
    if 'role' in data:
        user.role = data['role']
    if 'phone' in data:
        user.phone = data['phone']
    if 'password' in data:
        user.password = data['password']
    
    db.session.commit()
    
    return success_response({
        'id': user.id,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'email': user.email,
        'role': user.role
    })

@bp.route('/<int:user_id>', methods=['DELETE'])
@auth_required
@role_required('admin')
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return not_found('User not found')
    
    db.session.delete(user)
    db.session.commit()
    
    return success_response({}, message='User deleted successfully')