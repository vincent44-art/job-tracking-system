from datetime import datetime
from app import db

class Inventory(db.Model):
    __tablename__ = 'inventory'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.String(50), nullable=False)
    fruit_type = db.Column(db.String(50), nullable=False)
    unit = db.Column(db.String(20), nullable=False)
    location = db.Column(db.String(100))
    expiry_date = db.Column(db.Date)
    added_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    adder = db.relationship('User', backref=db.backref('added_inventory', lazy=True))