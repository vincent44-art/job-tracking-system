import os
from datetime import timedelta
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'

    # Path to the bundled SQLite DB file - must be defined early
    _sqlite_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'instance', 'fruit.db')

    # Check if we should force SQLite FIRST - this takes absolute precedence
    # Set FORCE_LOCAL_SQLITE=true to ignore DATABASE_URL completely
    force_sqlite = os.environ.get('FORCE_LOCAL_SQLITE', '').lower() in ('1', 'true', 'yes')

    # If forcing SQLite, use it regardless of DATABASE_URL
    if force_sqlite:
        SQLALCHEMY_DATABASE_URI = 'sqlite:///' + _sqlite_path
    else:
        # Only read DATABASE_URL if NOT forcing SQLite
        # Build SQLALCHEMY_DATABASE_URI from environment variables when DATABASE_URL is not provided.
        # Support either a full DATABASE_URL or individual DB_USER/DB_PASSWORD/DB_HOST/DB_NAME variables.
        # Production deployments (e.g. Render) often set DATABASE_URL to a
        # managed Postgres instance. For local/test setups we sometimes want to
        # force using the bundled SQLite DB at `instance/fruit.db`. To override a
        # platform-provided DATABASE_URL and force the local SQLite file, set
        # the env var `FORCE_LOCAL_SQLITE=true`.
        _env_db_url = os.environ.get('DATABASE_URL')
        if not _env_db_url:
            db_user = os.environ.get('DB_USER')
            db_password = os.environ.get('DB_PASSWORD')
            db_host = os.environ.get('DB_HOST')
            db_name = os.environ.get('DB_NAME')
            if db_user and db_password and db_host and db_name:
                # Quote the password to safely include special characters
                password_quoted = quote_plus(db_password)
                _env_db_url = f"mysql+pymysql://{db_user}:{password_quoted}@{db_host}/{db_name}"

        # Default to SQLite
        SQLALCHEMY_DATABASE_URI = 'sqlite:///' + _sqlite_path

        # Try external database only if DATABASE_URL is set
        if _env_db_url:
            try:
                # Do a lightweight connection check with short timeout
                from sqlalchemy import create_engine
                engine = create_engine(_env_db_url, connect_args={"connect_timeout": 5})
                conn = engine.connect()
                conn.close()
                # If connection successful, use the external database
                SQLALCHEMY_DATABASE_URI = _env_db_url
            except Exception as e:
                # Log the error and fall back to SQLite
                import sys
                print(
                    f"[config] WARNING: could not connect to DATABASE_URL ({e}). "
                    f"Falling back to local sqlite at {_sqlite_path}",
                    file=sys.stderr,
                )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    # JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    # JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # Configure CORS origins. In production set CORS_ORIGINS as a comma-separated
    # environment variable, e.g. CORS_ORIGINS=https://app.example.com,https://admin.example.com
    _cors_env = os.environ.get('CORS_ORIGINS')
    if _cors_env:
        CORS_ORIGINS = [o.strip() for o in _cors_env.split(',') if o.strip()]
    else:
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

