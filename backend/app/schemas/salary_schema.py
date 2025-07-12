from app import ma
from app.models.salary import Salary

class SalarySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Salary
        load_instance = True
        include_fk = True