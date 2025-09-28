from flask_restful import Resource, reqparse
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from flask import current_app, request
from ..models.user import User
from ..utils.helpers import make_response_data, get_current_user

from flask import make_response
from datetime import timedelta


class LoginResource(Resource):
    def post(self):
        # Accept both JSON and form data
        if request.is_json:
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')
        else:
            parser = reqparse.RequestParser()
            parser.add_argument('email', type=str, required=True)
            parser.add_argument('password', type=str, required=True)
            args = parser.parse_args()
            email = args['email']
            password = args['password']

        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            access_token = create_access_token(identity=user.id, additional_claims={"role": user.role.value})
            refresh_token = create_refresh_token(identity=user.id)
            return make_response_data(data={
                'access_token': access_token,
                'refresh_token': refresh_token,
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


class RefreshResource(Resource):
    def post(self):
        data = request.get_json()
        refresh_token = data.get('refresh_token')
        if not refresh_token:
            return make_response_data(success=False, message="Refresh token required", status_code=400)

        try:
            # Decode the refresh token to get identity
            from flask_jwt_extended import decode_token
            decoded = decode_token(refresh_token, allow_expired=False)
            identity = decoded['sub']
            access_token = create_access_token(identity=identity)
            return make_response_data(data={'access_token': access_token}, message="Token refreshed successfully")
        except Exception as e:
            return make_response_data(success=False, message="Invalid refresh token", status_code=401)
