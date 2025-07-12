from app import ma
from app.models.sale import Sale

class SaleSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Sale
        load_instance = True
        include_fk = True