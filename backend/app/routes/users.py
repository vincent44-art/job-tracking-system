from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User, UserRole
from app.models.salary import Salary
from app.schemas.user_schema import UserSchema
from app.utils.decorators import role_required
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date

users_bp = Blueprint('users_bp', __name__)
user_schema = UserSchema()
users_schema = UserSchema(many=True)

# Note: All endpoints here require CEO access
@users_bp.route('/', methods=['GET'])
@jwt_required()
@role_required('CEO')
def get_users():
    users = User.query.all()
    return jsonify(users_schema.dump(users))

@users_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('CEO')
def create_user():
    data = request.get_json()
    errors = user_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "User with this email already exists"}), 409
        
    new_user = User(
        email=data['email'],
        name=data['name'],
        role=UserRole(data.get('role')),
        salary=data.get('salary')
    )
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify(user_schema.dump(new_user)), 201

@users_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@role_required('CEO')
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.get_json()
    user.name = data.get('name', user.name)
    user.email = data.get('email', user.email)
    user.role = UserRole(data.get('role', user.role.value))
    user.salary = data.get('salary', user.salary)
    db.session.commit()
    return jsonify(user_schema.dump(user))

@users_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('CEO')
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": "User deleted successfully"})

@users_bp.route('/<int:id>/salary', methods=['PUT'])
@jwt_required()
@role_required('CEO')
def update_user_salary(id):
    user = User.query.get_or_404(id)
    data = request.get_json()
    new_salary = data.get('salary')
    if new_salary is None:
        return jsonify({"msg": "Salary not provided"}), 400
    user.salary = new_salary
    db.session.commit()
    return jsonify(user_schema.dump(user))

@users_bp.route('/<int:id>/pay-salary', methods=['POST'])
@jwt_required()
@role_required('CEO')
def pay_salary(id):
    ceo_id = get_jwt_identity()
    user_to_pay = User.query.get_or_404(id)

    if not user_to_pay.salary or user_to_pay.salary <= 0:
        return jsonify({"msg": "User has no salary set or salary is zero"}), 400

    payment_record = Salary(
        user_id=user_to_pay.id,
        amount=user_to_pay.salary,
        payment_date=date.today(),
        is_paid=True,
        paid_by=ceo_id
    )
    
    user_to_pay.is_paid = True
    
    db.session.add(payment_record)
    db.session.commit()
    
    return jsonify({"msg": f"Salary of KES {user_to_pay.salary} paid to {user_to_pay.name}"}), 200