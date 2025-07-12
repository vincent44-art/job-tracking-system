from datetime import datetime
from app import db

class StockMovement(db.Model):
    __tablename__ = 'stock_movements'
    id = db.Column(db.Integer, primary_key=True)
    fruit_type = db.Column(db.String(50), nullable=False)
    movement_type = db.Column(db.String(10), nullable=False) # 'in' or 'out'
    quantity = db.Column(db.String(50), nullable=False)
    unit = db.Column(db.String(20), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)
    added_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    remaining_stock = db.Column(db.String(50))

    adder = db.relationship('User', backref=db.backref('stock_movements', lazy=True))