import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'a_default_secret_key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'a_default_jwt_secret_key')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///dev.db')
    SQLALCHEMY_ECHO = True # Log SQL queries to the console

class ProductionConfig(Config):
    DEBUG = False
    # The DATABASE_URL must be set in the environment for production
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')

config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}