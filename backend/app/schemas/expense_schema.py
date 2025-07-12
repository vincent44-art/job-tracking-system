from app import ma
from app.models.expense import Expense

class ExpenseSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Expense
        load_instance = True
        include_fk = True