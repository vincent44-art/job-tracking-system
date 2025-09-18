from flask_restful import Resource, reqparse
from backend.models.seller_fruit import SellerFruit
from backend.extensions import db
from flask import request
from datetime import datetime

class SellerFruitListResource(Resource):
    def get(self):
        fruits = SellerFruit.query.all()
        return [fruit.to_dict() for fruit in fruits], 200

    def post(self):
        data = request.get_json()

        # Log incoming data for debugging
        print(f"Received POST data: {data}")

        # Extract fields
        stock_name = data.get('stock_name')
        fruit_name = data.get('fruit_name')
        qty = data.get('qty')
        unit_price = data.get('unit_price')
        date_str = data.get('date')
        amount = data.get('amount')

        # Check for missing fields
        missing_fields = []
        if not stock_name:
            missing_fields.append('stock_name')
        if not fruit_name:
            missing_fields.append('fruit_name')
        if qty is None:
            missing_fields.append('qty')
        if unit_price is None:
            missing_fields.append('unit_price')
        if not date_str:
            missing_fields.append('date')
        if amount is None:
            missing_fields.append('amount')

        if missing_fields:
            error_message = f"Missing required fields: {', '.join(missing_fields)}"
            print(error_message)
            return {"message": error_message}, 400

        # Validate numeric fields
        try:
            qty = float(qty)
            if qty <= 0:
                error_message = "Quantity must be a positive number"
                print(error_message)
                return {"message": error_message}, 400
        except (ValueError, TypeError):
            error_message = "Quantity must be a valid number"
            print(error_message)
            return {"message": error_message}, 400

        try:
            unit_price = float(unit_price)
            if unit_price <= 0:
                error_message = "Unit price must be a positive number"
                print(error_message)
                return {"message": error_message}, 400
        except (ValueError, TypeError):
            error_message = "Unit price must be a valid number"
            print(error_message)
            return {"message": error_message}, 400

        try:
            amount = float(amount)
            if amount <= 0:
                error_message = "Amount must be a positive number"
                print(error_message)
                return {"message": error_message}, 400
        except (ValueError, TypeError):
            error_message = "Amount must be a valid number"
            print(error_message)
            return {"message": error_message}, 400

        # Convert date string to date object
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            error_message = "Invalid date format. Use YYYY-MM-DD"
            print(error_message)
            return {"message": error_message}, 400

        new_fruit = SellerFruit(
            stock_name=stock_name,
            fruit_name=fruit_name,
            qty=qty,
            unit_price=unit_price,
            date=date,
            amount=amount
        )
        db.session.add(new_fruit)
        db.session.commit()
        return new_fruit.to_dict(), 201

class SellerFruitResource(Resource):
    def get(self, fruit_id):
        fruit = SellerFruit.query.get_or_404(fruit_id)
        return fruit.to_dict(), 200

    def put(self, fruit_id):
        fruit = SellerFruit.query.get_or_404(fruit_id)
        data = request.get_json()

        fruit.stock_name = data.get('stock_name', fruit.stock_name)
        fruit.fruit_name = data.get('fruit_name', fruit.fruit_name)
        fruit.qty = data.get('qty', fruit.qty)
        fruit.unit_price = data.get('unit_price', fruit.unit_price)
        fruit.amount = data.get('amount', fruit.amount)

        # Handle date conversion if provided
        if 'date' in data:
            try:
                fruit.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except ValueError:
                return {"message": "Invalid date format. Use YYYY-MM-DD"}, 400

        db.session.commit()
        return fruit.to_dict(), 200

    def delete(self, fruit_id):
        fruit = SellerFruit.query.get_or_404(fruit_id)
        db.session.delete(fruit)
        db.session.commit()
        return {"message": "Deleted successfully"}, 200
