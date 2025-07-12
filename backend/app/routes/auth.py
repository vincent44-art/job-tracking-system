from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app import db, bcrypt, BLOCKLIST
from app.models.user import User
from app.schemas.user_schema import UserSchema

auth_bp = Blueprint('auth_bp', __name__)
user_schema = UserSchema()

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Missing email or password"}), 400

    user = User.query.filter_by(email=data['email']).first()

    if user and user.check_password(data['password']):
        # Create token with user ID as identity and role as a custom claim
        access_token = create_access_token(
            identity=user.id, additional_claims={'role': user.role.value}
        )
        return jsonify(access_token=access_token, user=user_schema.dump(user))
    
    return jsonify({"msg": "Bad email or password"}), 401

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    BLOCKLIST.add(jti)
    return jsonify({"msg": "Successfully logged out"}), 200

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if user:
        return jsonify(user=user_schema.dump(user)), 200
    return jsonify({"msg": "Invalid token or user not found"}), 404