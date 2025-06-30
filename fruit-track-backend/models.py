# models.py
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Enum
import enum
from datetime import date

db = SQLAlchemy()

# Enum for Seller Status
class SellerStatus(enum.Enum):
    IN_TRANSIT = "In Transit"
    COMPLETED = "Completed"

# Enum for Expense Type
class ExpenseType(enum.Enum):
    FUEL = "Fuel"
    REPAIRS = "Repairs"
    OTHER = "Other"

class Purchase(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employee_name = db.Column(db.String(100), nullable=False)
    fruit_type = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=False)  # e.g., 'kg', 'box', 'piece'
    buyer_name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False, default=date.today)

    def to_dict(self):
        return {
            "id": self.id,
            "employee_name": self.employee_name,
            "fruit_type": self.fruit_type,
            "quantity": self.quantity,
            "unit": self.unit,
            "buyer_name": self.buyer_name,
            "amount": self.amount,
            "date": self.date.isoformat()
        }

class Sale(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    seller_name = db.Column(db.String(100), nullable=False)
    fruit_type = db.Column(db.String(50), nullable=False)
    quantity_taken = db.Column(db.Float, nullable=False)
    travel_date = db.Column(db.Date, nullable=False)
    status = db.Column(Enum(SellerStatus), nullable=False, default=SellerStatus.IN_TRANSIT)
    
    # These fields are updated later
    quantity_sold = db.Column(db.Float, nullable=True, default=0)
    actual_revenue = db.Column(db.Float, nullable=True, default=0)

    def to_dict(self):
        # Calculate remaining inventory on the fly
        remaining_inventory = self.quantity_taken - (self.quantity_sold or 0)
        
        return {
            "id": self.id,
            "seller_name": self.seller_name,
            "fruit_type": self.fruit_type,
            "quantity_taken": self.quantity_taken,
            "travel_date": self.travel_date.isoformat(),
            "status": self.status.value,
            "quantity_sold": self.quantity_sold,
            "actual_revenue": self.actual_revenue,
            "remaining_inventory": remaining_inventory
        }

class CarExpense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    expense_type = db.Column(Enum(ExpenseType), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False, default=date.today)
    description = db.Column(db.String(200), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "expense_type": self.expense_type.value,
            "amount": self.amount,
            "date": self.date.isoformat(),
            "description": self.description
        }