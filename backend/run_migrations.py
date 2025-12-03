#!/usr/bin/env python
"""
Run database migrations using Flask-Migrate.
This script properly initializes the Flask app context before running migrations.
"""
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app
from flask_migrate import Migrate, upgrade
from backend.extensions import db

def run_migrations():
    """Initialize app and run migrations."""
    try:
        app = create_app()
        migrate = Migrate(app, db)
        
        with app.app_context():
            print("Running database migrations...")
            upgrade()
            print("✅ Migrations completed successfully!")
            return 0
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(run_migrations())
