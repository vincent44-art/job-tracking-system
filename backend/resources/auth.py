from flask_restful import Resource, reqparse
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from flask import request
from ..models.user import User
from ..utils.helpers import make_response_data, get_current_user
from backend.extensions import db
import re


class LoginResource(Resource):
    def post(self):
        try:
            # Accept both JSON and form data
            if request.is_json:
                data = request.get_json(silent=True) or {}
                email = data.get('email')
                password = data.get('password')
            else:
                parser = reqparse.RequestParser()
                parser.add_argument('email', type=str, required=True)
                parser.add_argument('password', type=str, required=True)
                args = parser.parse_args()
                email = args['email']
                password = args['password']

            if not email or not password:
                return make_response_data(
                    success=False,
                    message="Email and password required",
                    status_code=400
                )

            user = User.query.filter_by(email=email).first()

            # USER NOT FOUND
            if not user:
                return make_response_data(
                    success=False,
                    message="Invalid credentials",
                    status_code=401
                )

            # PASSWORD INVALID
            if not user.check_password(password):
                return make_response_data(
                    success=False,
                    message="Invalid credentials",
                    status_code=401
                )

            # ROLE FIX: avoid crash if user.role is None
            role = user.role.value if getattr(user, "role", None) else "user"

            access_token = create_access_token(identity=user.id, additional_claims={"role": role})
            refresh_token = create_refresh_token(identity=user.id)

            # SAFE to_dict
            safe_user = {}
            try:
                safe_user = user.to_dict()
            except:
                safe_user = {
                    "id": user.id,
                    "email": user.email
                }

            return make_response_data(
                data={
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'user': safe_user
                },
                message="Login successful"
            )

        except Exception as e:
            # Log full exception to stdout (so Render shows stack trace) and return a 500
            import traceback, logging
            logging.exception("Unhandled exception during login")
            traceback.print_exc()
            return make_response_data(
                success=False,
                message=f"Server error during login: {str(e)}",
                status_code=500
            )


class MeResource(Resource):
    @jwt_required()
    def get(self):
        try:
            user = get_current_user()

            if not user:
                return make_response_data(success=False, message="User not found.", status_code=404)

            try:
                user_data = user.to_dict()
            except:
                user_data = {"id": user.id, "email": user.email}

            return make_response_data(data=user_data, message="Current user data fetched.")

        except Exception as e:
            return make_response_data(
                success=False,
                message=f"Server error: {str(e)}",
                status_code=500
            )


class RefreshResource(Resource):
    def post(self):
        try:
            data = request.get_json(silent=True) or {}
            refresh_token = data.get('refresh_token')

            if not refresh_token:
                return make_response_data(
                    success=False,
                    message="Refresh token required",
                    status_code=400
                )

            from flask_jwt_extended import decode_token
            decoded = decode_token(refresh_token, allow_expired=False)
            identity = decoded['sub']

            access_token = create_access_token(identity=identity)

            return make_response_data(
                data={'access_token': access_token},
                message="Token refreshed successfully"
            )

        except Exception:
            return make_response_data(
                success=False,
                message="Invalid refresh token",
                status_code=401
            )


class ChangePasswordResource(Resource):
    @jwt_required()
    def post(self):
        try:
            data = request.get_json(silent=True) or {}

            current_password = data.get('current_password')
            new_password = data.get('new_password')
            confirm_password = data.get('confirm_password')

            if not current_password or not new_password or not confirm_password:
                return make_response_data(
                    success=False,
                    message="All password fields are required",
                    status_code=400
                )

            if new_password != confirm_password:
                return make_response_data(
                    success=False,
                    message="New passwords do not match",
                    status_code=400
                )

            pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$'
            if not re.match(pattern, new_password):
                return make_response_data(
                    success=False,
                    message="Password must be at least 8 characters and include uppercase, lowercase, and a number",
                    status_code=400
                )

            user = get_current_user()
            if not user or not user.check_password(current_password):
                return make_response_data(
                    success=False,
                    message="Current password is incorrect",
                    status_code=400
                )

            user.set_password(new_password)
            user.is_first_login = False
            db.session.commit()

            return make_response_data(message="Password changed successfully")

        except Exception as e:
            return make_response_data(
                success=False,
                message=f"Server error: {str(e)}",
                status_code=500
            )
