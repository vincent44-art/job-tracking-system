from flask_restful import Resource, reqparse
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from flask import current_app
from models.user import User
from utils.helpers import make_response_data, get_current_user

from flask import make_response
from datetime import timedelta


class LoginResource(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('email', type=str, required=True)
        parser.add_argument('password', type=str, required=True)
        data = parser.parse_args()

        user = User.query.filter_by(email=data['email']).first()
        if user and user.check_password(data['password']):
            access_token = create_access_token(identity=user.id, additional_claims={"role": user.role.value})
            return make_response_data(data={
                'access_token': access_token,
                'user': user.to_dict()
            }, message="Login successful")
        return make_response_data(success=False, message="Invalid credentials", status_code=401)

class MeResource(Resource):
    @jwt_required()
    def get(self):
        user = get_current_user()
        if user:
            return make_response_data(data=user.to_dict(), message="Current user data fetched.")
        return make_response_data(success=False, message="User not found.", status_code=404)
