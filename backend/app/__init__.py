from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_cors import CORS

from app.config import config_by_name

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()
ma = Marshmallow()

# This will be a simple in-memory blocklist for logged-out tokens.
# For a production application, you should use a persistent store like Redis.
BLOCKLIST = set()

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Initialize extensions with the app
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)
    CORS(app) # Enable CORS for all routes by default

    # JWT Blocklist handlers
    @jwt.token_in_blocklist_loader
    def check_if_token_in_blocklist(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        return jti in BLOCKLIST

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return (
            jsonify(
                {"description": "The token has been revoked.", "error": "token_revoked"}
            ),
            401,
        )

    with app.app_context():
        # Import and register blueprints
        from .routes.auth import auth_bp
        from .routes.users import users_bp
        from .routes.inventory import inventory_bp
        from .routes.stock_movements import stock_movements_bp
        from .routes.sales import sales_bp
        from .routes.purchases import purchases_bp
        from .routes.gradients import gradients_bp
        from .routes.expenses import expenses_bp
        from .routes.messages import messages_bp
        from .routes.reports import reports_bp

        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(users_bp, url_prefix='/api/users')
        app.register_blueprint(inventory_bp, url_prefix='/api/inventory')
        app.register_blueprint(stock_movements_bp, url_prefix='/api/stock-movements')
        app.register_blueprint(sales_bp, url_prefix='/api/sales')
        app.register_blueprint(purchases_bp, url_prefix='/api/purchases')
        app.register_blueprint(gradients_bp, url_prefix='/api/gradients')
        app.register_blueprint(expenses_bp, url_prefix='/api/expenses')
        app.register_blueprint(messages_bp, url_prefix='/api/messages')
        app.register_blueprint(reports_bp, url_prefix='/api/reports')

        # This is needed for Flask-Migrate to detect the models
        from . import models

        return app