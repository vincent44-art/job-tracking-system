from app import ma
from app.models.message import Message
from marshmallow import fields

class MessageSchema(ma.SQLAlchemyAutoSchema):
    # Explicitly define the Enum field to ensure it serializes to a string
    recipient_role = fields.String() 

    class Meta:
        model = Message
        load_instance = True
        include_fk = True