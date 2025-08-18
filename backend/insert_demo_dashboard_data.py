import random
from datetime import datetime, timedelta
from backend.app import create_app, db
from backend.models.sales import Sale
from backend.models.purchases import Purchase
from backend.models.user import User
from backend.models.other_expense import OtherExpense
from backend.models.driver import DriverExpense

app = create_app()

FRUITS = ['Orange', 'Apple', 'Banana', 'Mango', 'Pineapple', 'Watermelon']

with app.app_context():
    # Add demo CEO if not exists
    ceo = User.query.filter_by(role='ceo').first()
    if not ceo:
        ceo = User(name='Demo CEO', email='ceo@example.com', role='ceo', salary=500)
        db.session.add(ceo)
        db.session.commit()

    # Add demo sales, purchases, car expenses, other expenses for each month and fruit
    year = datetime.now().year
    for month in range(1, 13):
        for fruit in FRUITS:
            # Purchases
            purchase_date = datetime(year, month, random.randint(1, 28))
            purchase = Purchase(fruit_type=fruit, cost=random.randint(1000, 3000), purchase_date=purchase_date)
            db.session.add(purchase)
            # Sales
            sale_date = purchase_date + timedelta(days=random.randint(1, 5))
            sale = Sale(fruit_type=fruit, revenue=random.randint(2000, 5000), sale_date=sale_date)
            db.session.add(sale)
        # Car expense
        car_exp = DriverExpense(amount=random.randint(500, 1500), date=datetime(year, month, random.randint(1, 28)))
        db.session.add(car_exp)
        # Other expense
        other_exp = OtherExpense(amount=random.randint(300, 1200), date=datetime(year, month, random.randint(1, 28)))
        db.session.add(other_exp)
    db.session.commit()
    print('Demo dashboard data inserted.')
