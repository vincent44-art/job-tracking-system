# This file makes the 'models' directory a Python package.
# Import all models here so Flask-Migrate can find them.
from .user import User
from .inventory import Inventory
from .stock_movement import StockMovement
from .sale import Sale
from .purchase import Purchase
from .gradient import Gradient
from .expense import Expense
from .salary import Salary
from .message import Message