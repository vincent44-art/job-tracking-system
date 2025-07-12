import enum
from datetime import datetime
from app import db, bcrypt

class UserRole(enum.Enum):
    CEO = 'CEO'
    STORE_KEEPER = 'Store Keeper'
    SELLER = 'Seller'
    PURCHASER = 'Purchaser'
    DRIVER = 'Driver'

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False, default=UserRole.SELLER)
    name = db.Column(db.String(100), nullable=False)
    salary = db.Column(db.Numeric(10, 2), nullable=True)
    is_paid = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.name}>'