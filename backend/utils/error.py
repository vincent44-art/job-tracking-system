from flask import jsonify

def bad_request(message='Bad request'):
    return jsonify({
        'success': False,
        'message': message
    }), 400

def unauthorized(message='Unauthorized'):
    return jsonify({
        'success': False,
        'message': message
    }), 401

def forbidden(message='Forbidden'):
    return jsonify({
        'success': False,
        'message': message
    }), 403

def not_found(message='Resource not found'):
    return jsonify({
        'success': False,
        'message': message
    }), 404

def server_error(message='Internal server error'):
    return jsonify({
        'success': False,
        'message': message
    }), 500