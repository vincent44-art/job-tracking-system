import os
from flask import Flask, jsonify
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
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # CORS Configuration
    app.config['CORS_HEADERS'] = 'Content-Type'
    app.config['CORS_SUPPORTS_CREDENTIALS'] = True
    app.config['CORS_ORIGINS'] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # JWT Configuration
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    migrate.init_app(app, db)

    # JWT Callbacks
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

    # Register Blueprints
    from resources import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # New Root Route
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Flask backend root - use /api for API routes'
        })

    # New /api Root Route
    @app.route('/api')
    def api_root():
        return jsonify({
            'message': '✅ API root - backend is running',
            'status': 'ok'
        })

    # Health check route
    @app.route('/api/health')
    def health_check():
        return jsonify({
            'success': True,
            'status': 'healthy',
            'message': 'Service is running'
        })

    # Error Handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return make_response_data(success=False, status_code=404, message="Resource not found.", errors=[str(error)])

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return make_response_data(success=False, status_code=500, message="An internal server error occurred.", errors=[str(error)])

    # Shell context
    @app.shell_context_processor
    def make_shell_context():
        return {
            'db': db,
            'User': User,
            'UserRole': UserRole
        }

    # Seed DB CLI Command
    @app.cli.command("seed-db")
    def seed_db():
        """Seeds the database with initial data."""
        print("Seeding database...")
        users_to_create = [
            {'email': 'ceo@fruittrack.com', 'role': UserRole.CEO, 'name': 'CEO User', 'salary': 100000},
            {'email': 'storekeeper@fruittrack.com', 'role': UserRole.STOREKEEPER, 'name': 'Store Keeper', 'salary': 50000},
            {'email': 'seller@fruittrack.com', 'role': UserRole.SELLER, 'name': 'Sales Person', 'salary': 40000},
            {'email': 'purchaser@fruittrack.com', 'role': UserRole.PURCHASER, 'name': 'Purchase Manager', 'salary': 45000},
            {'email': 'driver@fruittrack.com', 'role': UserRole.DRIVER, 'name': 'Driver Person', 'salary': 35000},
        ]
        
        for user_data in users_to_create:
            user = User.query.filter_by(email=user_data['email']).first()
            if not user:
                user = User(
                    email=user_data['email'],
                    role=user_data['role'],
                    name=user_data['name'],
                    salary=user_data['salary']
                )
                user.set_password('password123')
                db.session.add(user)
        
        db.session.commit()
        print("Database seeded successfully!")

    return app

# Main entry point
if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
