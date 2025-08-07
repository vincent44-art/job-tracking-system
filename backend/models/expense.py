from datetime import datetime
from extensions import db

class CarExpense(db.Model):
    __tablename__ = 'car_expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    car_number = db.Column(db.String(20), nullable=False)
    expense_type = db.Column(db.String(20), nullable=False)  # 'fuel', 'maintenance', 'repair', 'insurance', 'other'
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.Text)
    receipt = db.Column(db.String(255))
    approved = db.Column(db.Boolean, default=False)
    approved_by_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    def __repr__(self):
        return f'<CarExpense {self.expense_type} {self.amount}>'

class OtherExpense(db.Model):
    __tablename__ = 'other_expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    expense_type = db.Column(db.String(20), nullable=False)  # 'office', 'marketing', 'utility', 'rent', 'other'
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.Text)
    receipt = db.Column(db.String(255))
    processed_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    approved = db.Column(db.Boolean, default=False)
    approved_by_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    def __repr__(self):
        return f'<OtherExpense {self.expense_type} {self.amount}>'