from flask import Blueprint, request
from datetime import datetime
from models import Message
from extensions import db
from utils.auth import auth_required, role_required, get_current_user
from utils.response import success_response
from utils.error import bad_request, not_found

bp = Blueprint('messages', __name__, url_prefix='/api/ceo/messages')

@bp.route('/', methods=['GET'])
@auth_required
@role_required('ceo')
def get_messages():
    current_user = get_current_user()
    messages = Message.query.filter_by(recipient_id=current_user.id).all()
    
    messages_data = [{
        'id': message.id,
        'sender': {
            'id': message.sender.id,
            'firstName': message.sender.first_name,
            'lastName': message.sender.last_name
        },
        'subject': message.subject,
        'content': message.content,
        'read': message.read,
        'readAt': message.read_at.isoformat() if message.read_at else None,
        'createdAt': message.created_at.isoformat()
    } for message in messages]
    
    return success_response(messages_data)

@bp.route('/<int:message_id>/read', methods=['POST'])
@auth_required
@role_required('ceo')
def mark_as_read(message_id):
    current_user = get_current_user()
    message = Message.query.filter_by(id=message_id, recipient_id=current_user.id).first()
    
    if not message:
        return not_found('Message not found')
    
    if not message.read:
        message.read = True
        message.read_at = datetime.utcnow()
        db.session.commit()
    
    return success_response({
        'id': message.id,
        'read': message.read,
        'readAt': message.read_at.isoformat()
    })