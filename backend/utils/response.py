from flask import jsonify

def success_response(data=None, message='Success', status_code=200):
    response = {
        'success': True,
        'message': message,
        'data': data
    }
    return jsonify(response), status_code