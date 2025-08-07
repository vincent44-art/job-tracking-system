from datetime import datetime
from extensions import db

class Salary(db.Model):
    __tablename__ = 'salaries'
    
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    base_salary = db.Column(db.Float, nullable=False)
    bonus = db.Column(db.Float, default=0.0)
    deductions = db.Column(db.Float, default=0.0)
    effective_date = db.Column(db.DateTime, nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    payments = db.relationship('SalaryPayment', backref='salary', lazy=True)
    
    def __repr__(self):
        return f'<Salary for user {self.employee_id}>'

class SalaryPayment(db.Model):
    __tablename__ = 'salary_payments'
    
    id = db.Column(db.Integer, primary_key=True)
    salary_id = db.Column(db.Integer, db.ForeignKey('salaries.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, nullable=False)
    payment_method = db.Column(db.String(20), nullable=False)  # 'cash', 'bank', 'mobile'
    status = db.Column(db.String(20), default='pending')  # 'pending', 'paid', 'cancelled'
    processed_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    notes = db.Column(db.Text)
    
    def __repr__(self):
        return f'<SalaryPayment {self.amount} for salary {self.salary_id}>'