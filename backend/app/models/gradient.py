from datetime import datetime
from app import db

class Gradient(db.Model):
    __tablename__ = 'gradients'
    id = db.Column(db.Integer, primary_key=True)
    fruit_type = db.Column(db.String(50), nullable=False)
    gradient_type = db.Column(db.String(100), nullable=False)
    application_date = db.Column(db.Date, nullable=False)
    notes = db.Column(db.Text)
    applied_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    applier = db.relationship('User', backref=db.backref('applied_gradients', lazy=True))