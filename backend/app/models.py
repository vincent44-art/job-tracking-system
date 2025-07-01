# app/models.py
import uuid
from . import db, bcrypt
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), nullable=False) # 'ceo', 'purchaser', 'seller', 'driver'
    is_active = db.Column(db.Boolean, default=True)

    purchases = db.relationship('Purchase', backref='purchaser', lazy=True)
    assignments = db.relationship('SellerAssignment', backref='seller', lazy=True)
    car_expenses = db.relationship('CarExpense', backref='driver', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Purchase(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fruit_type = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=False) # e.g., 'kg', 'box', 'piece'
    buyer_name = db.Column(db.String(100), nullable=False) # Supplier name
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    purchaser_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    money_issued_snapshot = db.Column(db.Float, nullable=True) # Optional: snapshot of money issued at time of purchase

class SellerAssignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fruit_type = db.Column(db.String(50), nullable=False)
    quantity_assigned = db.Column(db.Float, nullable=False)
    money_issued = db.Column(db.Float, default=0.0)
    travel_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='In Transit') # 'In Transit', 'Completed'
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    sales = db.relationship('Sale', backref='assignment', lazy=True, cascade="all, delete-orphan")

class Sale(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quantity_sold = db.Column(db.Float, nullable=False)
    revenue_collected = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    assignment_id = db.Column(db.Integer, db.ForeignKey('seller_assignment.id'), nullable=False)

class CarExpense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    expense_type = db.Column(db.String(50), nullable=False) # 'Fuel', 'Repairs', 'Maintenance'
    description = db.Column(db.String(200))
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    driver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class OtherExpense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)