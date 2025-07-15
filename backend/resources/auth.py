from flask_restful import Resource, reqparse
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from flask import current_app
from models.user import User
from utils.helpers import make_response_data, get_current_user

class LoginResource(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('email', type=str, required=True, help='Email cannot be blank')
        parser.add_argument('password', type=str, required=True, help='Password cannot be blank')
        data = parser.parse_args()

        try:
            user = User.query.filter_by(email=data['email']).first()

            if user and user.check_password(data['password']):
                # Optional: Check if is_active exists on the model
                if hasattr(user, 'is_active') and not user.is_active:
                    return make_response_data(
                        success=False,
                        message="User account is inactive.",
                        status_code=401
                    )

                access_token = create_access_token(identity=user.id, fresh=True)
                refresh_token = create_refresh_token(identity=user.id)

                response_data = {
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'user': user.to_dict() if hasattr(user, 'to_dict') else {}
                }

                return make_response_data(data=response_data, message="Login successful.")

            return make_response_data(success=False, message="Invalid credentials.", status_code=401)

        except Exception as e:
            current_app.logger.error(f"Login error: {str(e)}")
            return make_response_data(success=False, message="Internal server error.", status_code=500)


class RefreshTokenResource(Resource):
    @jwt_required(refresh=True)
    def post(self):
        current_user_id = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user_id, fresh=False)
        return make_response_data(data={'access_token': new_access_token}, message="Token refreshed.")


class MeResource(Resource):
    @jwt_required()
    def get(self):
        user = get_current_user()
        if user:
            return make_response_data(data=user.to_dict(), message="Current user data fetched.")
        return make_response_data(success=False, message="User not found.", status_code=404)
