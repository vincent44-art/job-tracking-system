from datetime import datetime
from app import db

class Salary(db.Model):
    __tablename__ = 'salaries'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_date = db.Column(db.Date, nullable=False)
    is_paid = db.Column(db.Boolean, default=True)
    paid_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('salary_records', lazy=True))
    payer = db.relationship('User', foreign_keys=[paid_by])