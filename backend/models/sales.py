from datetime import datetime
from backend.extensions import db

class Sale(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assignment = db.Column(db.String(100))  # Deprecated, use assignment_id
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignments.id'), nullable=True)
    fruit_type = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.String(50), nullable=False)
    revenue = db.Column(db.Float, nullable=False)
    sale_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'seller_id': self.seller_id,
            'seller_name': getattr(self, 'seller', None).name if hasattr(self, 'seller') and self.seller else None,
            'assignment': self.assignment,
            'assignment_id': self.assignment_id,
            'fruit_type': self.fruit_type,
            'quantity': self.quantity,
            'revenue': self.revenue,
            'sale_date': self.sale_date.isoformat() if self.sale_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }