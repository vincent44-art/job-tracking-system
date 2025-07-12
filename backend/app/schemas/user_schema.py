from app import ma
from app.models.user import User
from marshmallow import fields

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ("password_hash",) # Never serialize the password hash
    
    # Make password write-only (can be used for creating/updating but not for reading)
    password = fields.Str(load_only=True, required=False)
    role = fields.String() # To handle Enum correctly