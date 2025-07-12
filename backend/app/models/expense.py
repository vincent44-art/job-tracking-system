from datetime import datetime
from app import db

class Expense(db.Model):
    __tablename__ = 'expenses'
    id = db.Column(db.Integer, primary_key=True)
    expense_type = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    description = db.Column(db.Text)
    date = db.Column(db.Date, nullable=False)
    added_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    adder = db.relationship('User', backref=db.backref('expenses', lazy=True))