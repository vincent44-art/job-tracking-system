from datetime import datetime
from .user import db

class Purchase(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    purchaser_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    supplier_name = db.Column(db.String(100), nullable=False)
    fruit_type = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.String(50), nullable=False)
    cost = db.Column(db.Float, nullable=False)
    purchase_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'purchaser_id': self.purchaser_id,
            'purchaser_name': self.purchaser.name,
            'supplier_name': self.supplier_name,
            'fruit_type': self.fruit_type,
            'quantity': self.quantity,
            'cost': self.cost,
            'purchase_date': self.purchase_date.isoformat(),
            'created_at': self.created_at.isoformat()
        }