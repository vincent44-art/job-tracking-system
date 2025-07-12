from datetime import datetime
from app import db

class Sale(db.Model):
    __tablename__ = 'sales'
    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assignment = db.Column(db.String(255))
    fruit_type = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.String(50), nullable=False)
    revenue = db.Column(db.Numeric(10, 2), nullable=False)
    date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    seller = db.relationship('User', backref=db.backref('sales', lazy=True))