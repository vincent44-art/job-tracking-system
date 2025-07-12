from app import ma
from app.models.stock_movement import StockMovement

class StockMovementSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = StockMovement
        load_instance = True
        include_fk = True