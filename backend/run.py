# backend/run.py

import os
from app import create_app
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Determine the configuration to use (development or production)
config_name = os.getenv('FLASK_ENV', 'development')
if config_name == 'development':
    # This handles the deprecation warning
    os.environ['FLASK_DEBUG'] = '1'

# Create the Flask app instance
app = create_app(config_name)


# -------------------------------------------------------------------
#  CUSTOM CLI COMMANDS MUST BE DEFINED HERE
#  They must be in the global scope, AFTER `app` is created,
#  and BEFORE the `if __name__ == '__main__':` block.
# -------------------------------------------------------------------
@app.cli.command("create-ceo")
def create_ceo():
    """Creates the initial CEO user."""
    from app import db
    from app.models.user import User, UserRole
    import getpass

    print("--- Create Initial CEO User ---")
    name = input("Enter CEO Name: ")
    email = input("Enter CEO Email: ")
    password = getpass.getpass("Enter CEO Password: ")

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        print(f"\nError: User with email {email} already exists.")
        return

    # Create new CEO user
    ceo = User(
        name=name,
        email=email,
        role=UserRole.CEO,
        salary=0
    )
    ceo.set_password(password)

    # Add to the database within the application context
    with app.app_context():
        db.session.add(ceo)
        db.session.commit()

    print(f"\nSuccess! CEO user '{name}' created.")


# -------------------------------------------------------------------
#  This block is only used when you run `python run.py` directly
# -------------------------------------------------------------------
if __name__ == '__main__':
    app.run()