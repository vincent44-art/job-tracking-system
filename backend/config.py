# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'VGSZg9rsthBruVW4mqdKhejHFFeUAdUOkv-gfRd9mDU')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///fruit_track.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False