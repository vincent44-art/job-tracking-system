from flask_restful import Resource
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from ..models import db, User, Inventory, Sale, Purchase, UserRole
from ..models.driver import DriverExpense
from ..models.other_expense import OtherExpense
from ..utils.helpers import make_response_data

class CEODashboardResource(Resource):
    @jwt_required()
    def get(self):
        # Aggregate stats for CEO overview
        total_users = User.query.count()
        total_inventory_items = Inventory.query.count()
        total_sales = db.session.query(func.sum(Sale.amount)).scalar() or 0
        total_purchases = db.session.query(func.sum(Purchase.amount)).scalar() or 0
        total_car_expenses = db.session.query(func.sum(DriverExpense.amount)).scalar() or 0
        total_other_expenses = db.session.query(func.sum(OtherExpense.amount)).scalar() or 0
        # Sum all user salaries
        total_salaries = db.session.query(func.sum(User.salary)).scalar() or 0
        net_profit = total_sales - (total_purchases + total_car_expenses + total_other_expenses + total_salaries)

        # Fruit performance: aggregate for all fruits
        fruit_performance = []
        fruit_types = db.session.query(Sale.fruit_type).distinct().all()
        for fruit_row in fruit_types:
            fruit_type = fruit_row[0]
            purchases = db.session.query(func.sum(Purchase.amount)).filter(Purchase.fruit_type == fruit_type).scalar() or 0
            sales = db.session.query(func.sum(Sale.amount)).filter(Sale.fruit_type == fruit_type).scalar() or 0
            profit = sales - purchases
            profit_margin = (profit / purchases * 100) if purchases else 0
            fruit_performance.append({
                'fruitType': fruit_type,
                'purchases': purchases,
                'sales': sales,
                'profit': profit,
                'profitMargin': profit_margin
            })
        # Sort by profit descending
        fruit_performance.sort(key=lambda x: x['profit'], reverse=True)

        # Monthly data: aggregate sales, purchases, expenses, salaries per month
        monthly_data = []
        for month in range(1, 13):
            sales = db.session.query(func.sum(Sale.amount)).filter(func.extract('month', Sale.date) == month).scalar() or 0
            purchases = db.session.query(func.sum(Purchase.amount)).filter(func.extract('month', Purchase.date) == month).scalar() or 0
            car_expenses = db.session.query(func.sum(DriverExpense.amount)).filter(func.extract('month', DriverExpense.date) == month).scalar() or 0
            other_expenses = db.session.query(func.sum(OtherExpense.amount)).filter(func.extract('month', OtherExpense.date) == month).scalar() or 0
            salaries = db.session.query(func.sum(User.salary)).scalar() or 0  # Assuming salaries are monthly
            expenses = purchases + car_expenses + other_expenses + salaries
            monthly_data.append({
                'month': month,
                'sales': sales,
                'purchases': purchases,
                'expenses': car_expenses + other_expenses,
                'salaries': salaries
            })

        stats = {
            'totalUsers': total_users,
            'totalInventoryItems': total_inventory_items,
            'totalSales': total_sales,
            'totalPurchases': total_purchases,
            'totalCarExpenses': total_car_expenses,
            'totalOtherExpenses': total_other_expenses,
            'totalSalaries': total_salaries,
            'netProfit': net_profit
        }

        return make_response_data(data={
            'stats': stats,
            'fruitPerformance': fruit_performance,
            'monthlyData': monthly_data
        }, message='CEO dashboard overview fetched.')
