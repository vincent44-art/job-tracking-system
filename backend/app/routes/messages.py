from flask import Blueprint, request, jsonify
from app import db
from app.models.message import Message
from app.models.user import UserRole
from app.schemas.message_schema import MessageSchema
from app.utils.decorators import role_required
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

messages_bp = Blueprint('messages_bp', __name__)
message_schema = MessageSchema()
messages_schema = MessageSchema(many=True)

@messages_bp.route('/', methods=['GET'])
@jwt_required()
def get_messages():
    """
    Get messages.
    CEO sees all messages. Other roles see messages sent to their role.
    """
    user_role = get_jwt()['role']
    query = Message.query

    if user_role != UserRole.CEO.value:
        query = query.filter_by(recipient_role=UserRole(user_role))
    
    messages = query.order_by(Message.created_at.desc()).all()
    return jsonify(messages_schema.dump(messages))

@messages_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('CEO')
def send_message():
    """Send a message from the CEO to a specific role."""
    data = request.get_json()
    ceo_id = get_jwt_identity()

    if not data.get('message') or not data.get('recipient_role'):
        return jsonify({"msg": "Message content and recipient_role are required"}), 400

    try:
        new_message = Message(
            sender_id=ceo_id,
            recipient_role=UserRole(data['recipient_role']),
            message=data['message']
        )
        db.session.add(new_message)
        db.session.commit()
        return jsonify(message_schema.dump(new_message)), 201
    except ValueError:
        return jsonify({"msg": "Invalid role specified"}), 400
    except Exception as e:
        return jsonify({"msg": "Error sending message", "error": str(e)}), 500

@messages_bp.route('/<int:id>/read', methods=['PUT'])
@jwt_required()
def mark_message_as_read(id):
    """Mark a message as read. Can be done by anyone who can see the message."""
    user_role_str = get_jwt()['role']
    user_role = UserRole(user_role_str)

    message = Message.query.get_or_404(id)

    # Check if the user is authorized to read this message
    if user_role != UserRole.CEO and message.recipient_role != user_role:
        return jsonify({"msg": "You are not authorized to read this message"}), 403

    message.is_read = True
    db.session.commit()
    return jsonify(message_schema.dump(message))