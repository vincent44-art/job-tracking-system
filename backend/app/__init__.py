from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from config import Config

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for frontend (e.g. React on localhost:3000)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)

    # Import and register routes
    from app.routes import bp as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')

    return app
