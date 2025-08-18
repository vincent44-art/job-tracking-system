#!/usr/bin/env python3
"""
Sample data creation script for the fruit tracking system.
This script creates realistic sample data to populate the PerformanceOverview dashboard.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timedelta
from backend.app import app, db
from backend.models.user import User, UserRole
from backend.models.sales import Sale
from backend.models.purchases import Purchase
from backend.models.inventory import Inventory
from backend.models.driver import DriverExpense
from backend.models.other_expense import OtherExpense
from backend.models.gradient import Gradient

def create_sample_data():
    """Create comprehensive sample data for the dashboard."""
    
    with app.app_context():
        print("🍎 Creating sample data for PerformanceOverview dashboard...")
        
        # Clear existing sample data
        Sale.query.delete()
        Purchase.query.delete()
        Inventory.query.delete()
        DriverExpense.query.delete()
        OtherExpense.query.delete()
        Gradient.query.delete()
        db.session.commit()
        
        # Create users if they don't exist
        ceo = User.query.filter_by(email='ceo@fruittrack.com').first()
        if not ceo:
            ceo = User(
                email='ceo@fruittrack.com',
                name='CEO User',
                role=UserRole.CEO,
                salary=150000.00
            )
            ceo.set_password('password123')
            db.session.add(ceo)
        
        seller = User.query.filter_by(email='seller@fruittrack.com').first()
        if not seller:
            seller = User(
                email='seller@fruittrack.com',
                name='John Seller',
                role=UserRole.SELLER,
                salary=80000.00
            )
            seller.set_password('password123')
            db.session.add(seller)
        
        purchaser = User.query.filter_by(email='purchaser@fruittrack.com').first()
        if not purchaser:
            purchaser = User(
                email='purchaser@fruittrack.com',
                name='Jane Purchaser',
                role=UserRole.PURCHASER,
                salary=75000.00
            )
            purchaser.set_password('password123')
            db.session.add(purchaser)
        
        db.session.commit()
        
        # Sample fruit types
        fruit_types = ['Apples', 'Bananas', 'Oranges', 'Mangoes', 'Pineapples', 'Grapes']
        
        # Create sample inventory
        for fruit in fruit_types:
            inventory = Inventory(
                fruit_type=fruit,
                quantity=100 + (hash(fruit) % 200),
                cost_price=50 + (hash(fruit) % 100),
                selling_price=80 + (hash(fruit) % 150)
            )
            db.session.add(inventory)
        
        # Create sample purchases for the last 6 months
        base_date = datetime.now()
        
        for month_offset in range(6):
            month_date = base_date - timedelta(days=30 * month_offset)
            
            for fruit in fruit_types:
                # Create 2-3 purchases per fruit per month
                for i in range(2 + (hash(fruit + str(month_offset)) % 2)):
                    quantity = 50 + (hash(fruit + str(i)) % 100)
                    cost_per_unit = 30 + (hash(fruit + str(i)) % 70)
                    
                    purchase = Purchase(
                        fruit_type=fruit,
                        quantity=quantity,
                        cost=quantity * cost_per_unit,
                        purchase_date=month_date - timedelta(days=hash(fruit) % 15),
                        purchaser_id=purchaser.id
                    )
                    db.session.add(purchase)
        
        # Create sample sales for the last 6 months
        for month_offset in range(6):
            month_date = base_date - timedelta(days=30 * month_offset)
            
            for fruit in fruit_types:
                # Create 3-5 sales per fruit per month
                for i in range(3 + (hash(fruit + str(month_offset)) % 3)):
                    quantity = 20 + (hash(fruit + str(i)) % 80)
                    price_per_unit = 50 + (hash(fruit + str(i)) % 100)
                    
                    sale = Sale(
                        fruit_type=fruit,
                        quantity=quantity,
                        revenue=quantity * price_per_unit,
                        sale_date=month_date - timedelta(days=hash(fruit) % 20),
                        seller_id=seller.id
                    )
                    db.session.add(sale)
        
        # Create sample driver expenses
        driver_expenses = [
            ('Fuel', 15000, base_date - timedelta(days=10)),
            ('Maintenance', 8000, base_date - timedelta(days=25)),
            ('Insurance', 5000, base_date - timedelta(days=45)),
            ('Fuel', 12000, base_date - timedelta(days=60)),
            ('Maintenance', 6000, base_date - timedelta(days=75)),
        ]
        
        for description, amount, date in driver_expenses:
            expense = DriverExpense(
                description=description,
                amount=amount,
                date=date
            )
            db.session.add(expense)
        
        # Create sample other expenses
        other_expenses = [
            ('Office Rent', 30000, base_date - timedelta(days=5)),
            ('Utilities', 5000, base_date - timedelta(days=15)),
            ('Marketing', 8000, base_date - timedelta(days=30)),
            ('Office Supplies', 3000, base_date - timedelta(days=45)),
            ('Internet', 2000, base_date - timedelta(days=60)),
        ]
        
        for description, amount, date in other_expenses:
            expense = OtherExpense(
                description=description,
                amount=amount,
                date=date
            )
            db.session.add(expense)
        
        # Create sample gradients
        gradients = [
            Gradient(fruit_type='Apples', grade='Grade A', price_per_kg=120.00),
            Gradient(fruit_type='Apples', grade='Grade B', price_per_kg=100.00),
            Gradient(fruit_type='Bananas', grade='Grade A', price_per_kg=80.00),
            Gradient(fruit_type='Bananas', grade='Grade B', price_per_kg=60.00),
            Gradient(fruit_type='Oranges', grade='Grade A', price_per_kg=90.00),
            Gradient(fruit_type='Oranges', grade='Grade B', price_per_kg=70.00),
        ]
        
        for gradient in gradients:
            db.session.add(gradient)
        
        db.session.commit()
        
        # Print summary
        print("✅ Sample data created successfully!")
        print(f"   Users: {User.query.count()}")
        print(f"   Sales: {Sale.query.count()}")
        print(f"   Purchases: {Purchase.query.count()}")
        print(f"   Inventory: {Inventory.query.count()}")
        print(f"   Driver Expenses: {DriverExpense.query.count()}")
        print(f"   Other Expenses: {OtherExpense.query.count()}")
        print(f"   Gradients: {Gradient.query.count()}")
        
        # Calculate and display totals
        total_sales = sum(sale.revenue for sale in Sale.query.all())
        total_purchases = sum(purchase.cost for purchase in Purchase.query.all())
        total_driver_expenses = sum(expense.amount for expense in DriverExpense.query.all())
        total_other_expenses = sum(expense.amount for expense in OtherExpense.query.all())
        total_salaries = sum(user.salary for user in User.query.all())
        
        print("\n📊 Financial Summary:")
        print(f"   Total Sales Revenue: KES {total_sales:,.2f}")
        print(f"   Total Purchase Costs: KES {total_purchases:,.2f}")
        print(f"   Total Driver Expenses: KES {total_driver_expenses:,.2f}")
        print(f"   Total Other Expenses: KES {total_other_expenses:,.2f}")
        print(f"   Total Salaries: KES {total_salaries:,.2f}")
        print(f"   Net Profit: KES {(total_sales - total_purchases - total_driver_expenses - total_other_expenses - total_salaries):,.2f}")

if __name__ == "__main__":
    create_sample_data()
