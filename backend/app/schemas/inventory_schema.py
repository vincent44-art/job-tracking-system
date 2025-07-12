from app import ma
from app.models.inventory import Inventory

class InventorySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Inventory
        load_instance = True
        include_fk = True # Include foreign keys in the serialized output