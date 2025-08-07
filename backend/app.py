import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(test_config=None):
    """Application factory pattern with configuration options"""
    app = Flask(__name__)
    
    # ========================
    # Configuration Setup
    # ========================
    load_dotenv()  # Load environment variables from .env file
    
    # Default configuration
    app.config.update(
        SECRET_KEY=os.getenv('SECRET_KEY', os.urandom(32).hex()),
        SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URL', 'sqlite:///app.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SQLALCHEMY_ENGINE_OPTIONS={
            'pool_size': 10,
            'max_overflow': 20,
            'pool_pre_ping': True,
            'pool_recycle': 3600,
            'connect_args': {'connect_timeout': 5}
        },
        JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY', os.urandom(32).hex()),
        JWT_ACCESS_TOKEN_EXPIRES=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600)),
        JWT_TOKEN_LOCATION=['headers'],
        JWT_HEADER_NAME='Authorization',
        JWT_HEADER_TYPE='Bearer'
    )

    # Override with test config if provided
    if test_config:
        app.config.update(test_config)

    # ========================
    # Initialize Extensions
    # ========================
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configure CORS
    CORS(app, resources={
        r"/*": {
            "origins": os.getenv('CORS_ORIGINS', '*').split(','),
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })

    # ========================
    # Register Blueprints
    # ========================
    register_blueprints(app)

    # ========================
    # Shell Context & CLI Commands
    # ========================
    register_shell_context(app)
    register_commands(app)

    # ========================
    # Error Handlers
    # ========================
    register_error_handlers(app)

    return app

def register_blueprints(app):
    """Register all application blueprints"""
    from controllers import (
        auth_controller, user_controller, purchase_controller,
        sale_controller, inventory_controller, salary_controller,
        expense_controller, performance_controller, message_controller,
        data_controller
    )
    
    blueprints = [
        (auth_controller.bp, '/api/auth'),
        (user_controller.bp, '/api/users'),
        (purchase_controller.bp, '/api/purchases'),
        (sale_controller.bp, '/api/sales'),
        (inventory_controller.bp, '/api/inventory'),
        (salary_controller.bp, '/api/salaries'),
        (expense_controller.bp, '/api/expenses'),
        (performance_controller.bp, '/api/performance'),
        (message_controller.bp, '/api/messages'),
        (data_controller.bp, '/api/data')
    ]
    
    for bp, url_prefix in blueprints:
        app.register_blueprint(bp, url_prefix=url_prefix)

def register_shell_context(app):
    """Register shell context items"""
    @app.shell_context_processor
    def make_shell_context():
        from models import (
            User, Purchase, Sale, Inventory, 
            StockMovement, Salary, SalaryPayment,
            CarExpense, OtherExpense, Message
        )
        return {
            'db': db,
            'User': User,
            'Purchase': Purchase,
            'Sale': Sale,
            'Inventory': Inventory,
            'StockMovement': StockMovement,
            'Salary': Salary,
            'SalaryPayment': SalaryPayment,
            'CarExpense': CarExpense,
            'OtherExpense': OtherExpense,
            'Message': Message
        }

def register_commands(app):
    """Register CLI commands"""
    @app.cli.command('init-db')
    def init_db():
        """Initialize the database"""
        db.create_all()
        print("Database initialized.")

    @app.cli.command('create-admin')
    def create_admin():
        """Create an admin user"""
        from models.user import User
        from werkzeug.security import generate_password_hash
        
        admin = User(
            first_name='Admin',
            last_name='User',
            email='admin@example.com',
            phone='+1234567890',
            role='admin',
            password_hash=generate_password_hash('admin123'),
            active=True
        )
        
        try:
            db.session.add(admin)
            db.session.commit()
            print("Admin user created successfully.")
        except Exception as e:
            db.session.rollback()
            print(f"Error creating admin user: {str(e)}")

def register_error_handlers(app):
    """Register error handlers"""
    from werkzeug.exceptions import HTTPException
    from flask import jsonify
    
    @app.errorhandler(HTTPException)
    def handle_http_error(e):
        """Return JSON instead of HTML for HTTP errors"""
        response = {
            "error": e.name,
            "message": e.description,
            "status_code": e.code
        }
        return jsonify(response), e.code

# Create the application instance
app = create_app()

if __name__ == '__main__':
    app.run(
        host=os.getenv('FLASK_HOST', '0.0.0.0'),
        port=int(os.getenv('FLASK_PORT', 5000)),
        debug=os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    )