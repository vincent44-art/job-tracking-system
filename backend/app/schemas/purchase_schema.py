from app import ma
from app.models.purchase import Purchase

class PurchaseSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Purchase
        load_instance = True  # Creates model instances from validated data
        include_fk = True     # Includes foreign keys (e.g., purchaser_id) in the output