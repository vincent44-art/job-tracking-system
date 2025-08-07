from datetime import datetime
from extensions import db

class Sale(db.Model):
    __tablename__ = 'sales'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    # Add other sale-specific fields here
    
    # Relationships (if any)
    # Example:
    # items = db.relationship('SaleItem', backref='sale', lazy=True)
    
    def __repr__(self):
        return f'<Sale {self.id}>'