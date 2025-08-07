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
from resources import api_bp  # Your API blueprints
from resources.dashboard import dashboard_bp

# Load environment variables
load_dotenv()

# Path to your React build folder
FRONTEND_BUILD_DIR = os.path.join(os.getcwd(), 'Frontend', 'build')

# Initialize extensions
db = db
jwt = JWTManager()
cors = CORS()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__, static_folder=FRONTEND_BUILD_DIR, static_url_path='/')
    app.config.from_object(config_class)

    # CORS setup
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
    # app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

    # Initialize Extensions
    db.init_app(app)
    jwt.init_app(app)
    # cors.init_app(app, resources={r"/*": {
    #     "origins": app.config['CORS_ORIGINS'],
    #     "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    #     "allow_headers": ["Content-Type", "Authorization"],
    #     "supports_credentials": True
    # }})
    cors.init_app(
        app,
        resources={r"/*": {
            "origins": [
                "http://localhost:3000",
                "http://127.0.0.1:3000"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }},
        supports_credentials=True
    )

    
    migrate.init_app(app, db)

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'success': False, 'message': 'The token has expired', 'error': 'token_expired'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'success': False, 'message': 'Invalid token', 'error': 'invalid_token'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'success': False, 'message': 'Missing access token', 'error': 'authorization_required'}), 401

    # Register Blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp)

    # Health Check
    @app.route('/api/health')
    def health_check():
        return jsonify({'success': True, 'status': 'healthy', 'message': 'Service is running', 'version': '1.0.0'})

    # CORS Test Route
    @app.route('/api/cors-test')
    def cors_test():
        from flask import request
        return jsonify({
            'success': True,
            'headers': dict(request.headers),
            'message': 'CORS test route',
        })

    # Serve React frontend
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        full_path = os.path.join(FRONTEND_BUILD_DIR, path)
        if path != "" and os.path.exists(full_path):
            return send_from_directory(FRONTEND_BUILD_DIR, path)
        return send_from_directory(FRONTEND_BUILD_DIR, 'index.html')

    # Error Handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return make_response_data(False, 404, "Resource not found.", [str(error)])

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return make_response_data(False, 500, "An internal server error occurred.", [str(error)])

    return app

# Global app for Gunicorn
app = create_app()

# Local Development
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)