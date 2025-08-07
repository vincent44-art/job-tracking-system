from datetime import datetime
from .user import db # <-- CORRECTED LINE

class Sale(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assignment = db.Column(db.String(100))
    fruit_type = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.String(50), nullable=False)
    revenue = db.Column(db.Float, nullable=False)
    sale_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'seller_id': self.seller_id,
            'seller_name': self.seller.name,
            'assignment': self.assignment,
            'fruit_type': self.fruit_type,
            'quantity': self.quantity,
            'revenue': self.revenue,
            'sale_date': self.sale_date.isoformat(),
            'created_at': self.created_at.isoformat()
        }