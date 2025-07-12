from datetime import datetime
from app import db

class Purchase(db.Model):
    __tablename__ = 'purchases'
    id = db.Column(db.Integer, primary_key=True)
    purchaser_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    supplier_name = db.Column(db.String(100), nullable=False)
    fruit_type = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.String(50), nullable=False)
    cost = db.Column(db.Numeric(10, 2), nullable=False)
    purchase_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    purchaser = db.relationship('User', backref=db.backref('purchases', lazy=True))