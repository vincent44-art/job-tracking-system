<<<<<<< HEAD
=======
from flask import jsonify, make_response

>>>>>>> f019a39 (Fix API path and token setup)
from flask import Blueprint
from flask_restful import Api

from .auth import LoginResource, RefreshTokenResource, MeResource
from .user import UserListResource, UserResource, UserSalaryResource, UserPaymentResource
from .inventory import InventoryListResource, InventoryResource, ClearInventoryResource
from .sales import SalesListResource, SalesResource, ClearSalesResource, SalesSummaryResource
from .purchases import PurchaseListResource, PurchaseResource, ClearPurchasesResource, PurchaseSummaryResource
from .stock import StockMovementListResource, ClearStockMovementsResource
from .gradients import GradientListResource, ClearGradientsResource
from .messages import MessageListResource, MessageResource, ClearMessagesResource
from .dashboard import (
    CEODashboardResource, SellerDashboardResource, 
    PurchaserDashboardResource, StorekeeperDashboardResource
)

api_bp = Blueprint('api', __name__)
api = Api(api_bp)

# Custom error handlers for the API
@api.representation('application/json')
def output_json(data, code, headers=None):
    """Custom JSON representation to ensure consistent response format"""
    from flask import make_response
    resp = make_response(jsonify({
        'success': code in [200, 201],
        'data': data,
        'status_code': code
    }), code)
    if headers:
        resp.headers.extend(headers)
    return resp

# Authentication
api.add_resource(LoginResource, '/auth/login')
api.add_resource(RefreshTokenResource, '/auth/refresh')
api.add_resource(MeResource, '/auth/me')

# User Management
api.add_resource(UserListResource, '/users')
api.add_resource(UserResource, '/users/<int:user_id>')
api.add_resource(UserSalaryResource, '/users/<int:user_id>/salary')
api.add_resource(UserPaymentResource, '/users/<int:user_id>/payment')

# Inventory Management
api.add_resource(InventoryListResource, '/inventory')
api.add_resource(InventoryResource, '/inventory/<int:inv_id>')
api.add_resource(ClearInventoryResource, '/inventory/clear')

# Stock Movement
api.add_resource(StockMovementListResource, '/stock-movements')  # Note: Fixed typo from '/stock-movements'
api.add_resource(ClearStockMovementsResource, '/stock-movements/clear')

# Sales Management
api.add_resource(SalesListResource, '/sales')
api.add_resource(SalesResource, '/sales/<int:sale_id>')
api.add_resource(ClearSalesResource, '/sales/clear')
api.add_resource(SalesSummaryResource, '/sales/summary')

# Purchase Management
api.add_resource(PurchaseListResource, '/purchases')
api.add_resource(PurchaseResource, '/purchases/<int:purchase_id>')
api.add_resource(ClearPurchasesResource, '/purchases/clear')
api.add_resource(PurchaseSummaryResource, '/purchases/summary')

# Gradient Management
api.add_resource(GradientListResource, '/gradients')
api.add_resource(ClearGradientsResource, '/gradients/clear')

# Messages
api.add_resource(MessageListResource, '/messages')
api.add_resource(MessageResource, '/messages/<int:message_id>')  # Removed '/read' suffix for consistency
api.add_resource(ClearMessagesResource, '/messages/clear')

# Dashboards
api.add_resource(CEODashboardResource, '/dashboard/ceo')
api.add_resource(SellerDashboardResource, '/dashboard/seller')
api.add_resource(PurchaserDashboardResource, '/dashboard/purchaser')
api.add_resource(StorekeeperDashboardResource, '/dashboard/storekeeper')

# Add a catch-all route for undefined API endpoints
@api_bp.route('/', defaults={'path': ''})
@api_bp.route('/<path:path>')
def catch_all(path):
    from flask import jsonify
    return jsonify({
        'success': False,
        'message': 'API endpoint not found',
        'error': 'not_found',
        'status_code': 404
    }), 404