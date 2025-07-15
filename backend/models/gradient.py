from datetime import datetime
from .user import db

class Gradient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fruit_type = db.Column(db.String(50), nullable=False)
    gradient_type = db.Column(db.String(50), nullable=False)
    application_date = db.Column(db.Date, nullable=False)
    notes = db.Column(db.Text)
    applied_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to get user who applied it
    applied_by_user = db.relationship('User', backref='applied_gradients')

    def to_dict(self):
        return {
            'id': self.id,
            'fruit_type': self.fruit_type,
            'gradient_type': self.gradient_type,
            'application_date': self.application_date.isoformat(),
            'notes': self.notes,
            'applied_by_id': self.applied_by,
            'applied_by_name': self.applied_by_user.name,
            'created_at': self.created_at.isoformat()
        }