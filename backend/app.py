import os
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import timedelta

from config import Config
from models.user import db, User, UserRole
from utils.helpers import make_response_data

# Load environment variables
load_dotenv()

# Initialize extensions
jwt = JWTManager()
cors = CORS()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__, static_folder=None)
    app.config.from_object(config_class)

    # CORS Configuration
    app.config['CORS_HEADERS'] = 'Content-Type'
    app.config['CORS_SUPPORTS_CREDENTIALS'] = True
    app.config['CORS_ORIGINS'] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5000"
    ]

    # JWT Expiry
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

    # Initialize Extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={
        r"/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    migrate.init_app(app, db)

    # JWT Error Callbacks
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'message': 'The token has expired',
            'error': 'token_expired'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Signature verification failed',
            'error': 'invalid_token'
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Request does not contain an access token',
            'error': 'authorization_required'
        }), 401

    # Blueprints
    from resources import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # Health check
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'success': True,
            'status': 'healthy',
            'message': 'Service is running',
            'version': '1.0.0'
        })

    # Root Endpoints
    @app.route('/api')
    def api_root():
        return jsonify({
            'message': 'API Root',
            'endpoints': {
                'health': '/api/health',
                'docs': 'Coming soon'
            }
        })

    @app.route('/')
    def root():
        return jsonify({
            'message': 'Fruit Tracking API',
            'status': 'running',
            'api_root': '/api'
        })

    # Serve JS files if needed
    @app.route('/static/<path:filename>')
    def serve_static(filename):
        return send_from_directory(os.path.join(app.root_path, 'static'), filename, mimetype='application/javascript')

    # Error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return make_response_data(False, 404, "Resource not found.", [str(error)])

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return make_response_data(False, 500, "An internal server error occurred.", [str(error)])

    return app

# ✅ Global app variable for Gunicorn
app = create_app()

# 👇 Optional: for running locally with `python app.py`
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
