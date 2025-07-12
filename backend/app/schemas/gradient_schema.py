from app import ma
from app.models.gradient import Gradient

class GradientSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Gradient
        load_instance = True
        include_fk = True