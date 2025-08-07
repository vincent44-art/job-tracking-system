from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db  # Changed to import from extensions.py instead of app

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    purchases = db.relationship(
        'Purchase',
        backref='purchaser',
        foreign_keys='Purchase.user_id',
        lazy=True
    )
    sales = db.relationship(
        'Sale',
        backref='seller',
        foreign_keys='Sale.user_id',
        lazy=True
    )
    inventory_items = db.relationship(
        'Inventory',
        backref='storekeeper',
        foreign_keys='Inventory.user_id',
        lazy=True
    )
    salaries = db.relationship(
        'Salary',
        backref='employee',
        foreign_keys='Salary.user_id',
        lazy=True
    )
    processed_payments = db.relationship(
        'SalaryPayment',
        backref='processed_by',
        foreign_keys='SalaryPayment.processed_by_id',
        lazy=True
    )
    car_expenses = db.relationship(
        'CarExpense',
        backref='driver',
        foreign_keys='CarExpense.user_id',
        lazy=True
    )
    other_expenses = db.relationship(
        'OtherExpense',
        backref='processed_by',
        foreign_keys='OtherExpense.user_id',
        lazy=True
    )
    sent_messages = db.relationship(
        'Message',
        backref='sender',
        foreign_keys='Message.sender_id',
        lazy=True
    )
    received_messages = db.relationship(
        'Message',
        backref='recipient',
        foreign_keys='Message.recipient_id',
        lazy=True
    )
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Converts user object to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'active': self.active,
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self):
        return f'<User {self.email}>'