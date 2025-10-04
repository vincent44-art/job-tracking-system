import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'instance', 'fruittrack.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    # JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    # JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    CORS_ORIGINS = ["http://localhost:3000"]

    # IT Alert Rules
    ALERT_RULES = {
        'failed_login_burst': {
            'condition': '>=5 failed_login from same IP within 15m',
            'severity': 'critical',
            'actions': ['block_ip', 'force_password_reset']
        },
        'mass_data_export': {
            'condition': '>1GB data export by non-admin',
            'severity': 'high',
            'actions': ['alert_it_team']
        },
        'api_error_burst': {
            'condition': '>=10 api_error within 5m',
            'severity': 'warning',
            'actions': ['review_api_usage']
        },
        'permission_change': {
            'condition': 'any permission_change',
            'severity': 'info',
            'actions': ['log_audit']
        }
    }

