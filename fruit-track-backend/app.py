# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from sqlalchemy import func

from models import db, Purchase, Sale, CarExpense, SellerStatus, ExpenseType

# --- APP SETUP ---
app = Flask(__name__)
CORS(app) # Allow requests from the React frontend

# Configure the database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///instance/fruit_track.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database with the app
db.init_app(app)

# --- STATIC DATA (as requested in the prompt) ---
FRUIT_TYPES = ["Apple", "Orange", "Banana", "Mango", "Grapes", "Strawberry", "Pineapple", "Watermelon"]

# --- HELPER ROUTES ---
@app.route('/api/meta/fruit-types', methods=['GET'])
def get_fruit_types():
    return jsonify(FRUIT_TYPES)

# --- PURCHASE API ROUTES ---
@app.route('/api/purchases', methods=['GET', 'POST'])
def handle_purchases():
    if request.method == 'POST':
        data = request.get_json()
        try:
            new_purchase = Purchase(
                employee_name=data['employee_name'],
                fruit_type=data['fruit_type'],
                quantity=float(data['quantity']),
                unit=data['unit'],
                buyer_name=data['buyer_name'],
                amount=float(data['amount']),
                date=datetime.strptime(data['date'], '%Y-%m-%d').date()
            )
            db.session.add(new_purchase)
            db.session.commit()
            return jsonify(new_purchase.to_dict()), 201
        except KeyError as e:
            return jsonify({"error": f"Missing field: {e}"}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    # GET request
    purchases = Purchase.query.order_by(Purchase.date.desc()).all()
    return jsonify([p.to_dict() for p in purchases])

# --- SELLER ASSIGNMENT (SALES) API ROUTES ---
@app.route('/api/sales', methods=['GET', 'POST'])
def handle_sales():
    if request.method == 'POST':
        data = request.get_json()
        try:
            new_sale = Sale(
                seller_name=data['seller_name'],
                fruit_type=data['fruit_type'],
                quantity_taken=float(data['quantity_taken']),
                travel_date=datetime.strptime(data['travel_date'], '%Y-%m-%d').date()
            )
            db.session.add(new_sale)
            db.session.commit()
            return jsonify(new_sale.to_dict()), 201
        except KeyError as e:
            return jsonify({"error": f"Missing field: {e}"}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
    
    # GET request
    sales = Sale.query.order_by(Sale.travel_date.desc()).all()
    return jsonify([s.to_dict() for s in sales])

@app.route('/api/sales/<int:sale_id>', methods=['PUT'])
def update_sale(sale_id):
    sale = Sale.query.get_or_404(sale_id)
    data = request.get_json()

    try:
        sale.quantity_sold = float(data.get('quantity_sold', sale.quantity_sold))
        sale.actual_revenue = float(data.get('actual_revenue', sale.actual_revenue))
        
        # Business Logic: Automatically update status if sales are complete
        if sale.quantity_sold is not None and sale.quantity_sold >= sale.quantity_taken:
            sale.status = SellerStatus.COMPLETED
        else:
            sale.status = SellerStatus.IN_TRANSIT
            
        db.session.commit()
        return jsonify(sale.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# --- CAR EXPENSE API ROUTES ---
@app.route('/api/expenses', methods=['GET', 'POST'])
def handle_expenses():
    if request.method == 'POST':
        data = request.get_json()
        try:
            new_expense = CarExpense(
                expense_type=ExpenseType(data['expense_type']),
                amount=float(data['amount']),
                date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
                description=data.get('description')
            )
            db.session.add(new_expense)
            db.session.commit()
            return jsonify(new_expense.to_dict()), 201
        except (KeyError, ValueError) as e:
            return jsonify({"error": f"Invalid or missing field: {e}"}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    # GET request
    expenses = CarExpense.query.order_by(CarExpense.date.desc()).all()
    return jsonify([e.to_dict() for e in expenses])


# --- DASHBOARD & ANALYTICS API ROUTE ---
@app.route('/api/dashboard/analytics', methods=['GET'])
def get_dashboard_analytics():
    try:
        # Calculate totals
        total_purchases = db.session.query(func.sum(Purchase.amount)).scalar() or 0.0
        total_sold_revenue = db.session.query(func.sum(Sale.actual_revenue)).scalar() or 0.0
        total_car_expenses = db.session.query(func.sum(CarExpense.amount)).scalar() or 0.0

        # Calculate Net Profit
        net_profit = total_sold_revenue - total_purchases - total_car_expenses

        # Calculate Profit Margin
        profit_margin = (net_profit / total_sold_revenue * 100) if total_sold_revenue > 0 else 0
        
        # Inventory Summary
        # This is a more complex calculation, for now we will provide totals.
        # A more detailed inventory would group by fruit_type.
        total_quantity_purchased = db.session.query(func.sum(Purchase.quantity)).scalar() or 0.0
        total_quantity_sold = db.session.query(func.sum(Sale.quantity_sold)).scalar() or 0.0
        
        response = {
            "summary": {
                "total_purchases": total_purchases,
                "total_sold_revenue": total_sold_revenue,
                "total_car_expenses": total_car_expenses,
                "net_profit": net_profit,
                "profit_margin": profit_margin
            },
            "inventory_overview": {
                "total_quantity_purchased": total_quantity_purchased,
                "total_quantity_sold": total_quantity_sold,
                "net_inventory_quantity": total_quantity_purchased - total_quantity_sold
            }
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- DATA MANAGEMENT ---
@app.route('/api/data/clear-all', methods=['POST'])
def clear_all_data():
    try:
        db.session.query(Sale).delete()
        db.session.query(Purchase).delete()
        db.session.query(CarExpense).delete()
        db.session.commit()
        return jsonify({"message": "All data has been cleared successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# --- MAIN EXECUTION ---
if __name__ == '__main__':
    with app.app_context():
        # Create the 'instance' folder if it doesn't exist
        import os
        if not os.path.exists('instance'):
            os.makedirs('instance')
        # Create database tables if they don't exist
        db.create_all()
    app.run(debug=True, port=5001)