
from flask import Blueprint, jsonify
from flask_restful import Api

# Import all resource classes
# from .auth import LoginResource, RefreshTokenResource, MeResource
from .auth import LoginResource, MeResource

from .user import UserListResource, UserResource, UserSalaryResource, UserPaymentResource
from .inventory import InventoryListResource, InventoryResource, ClearInventoryResource
from .sales import SalesListResource, SalesResource, ClearSalesResource, SalesSummaryResource
from .purchases import PurchaseListResource, PurchaseResource, ClearPurchasesResource, PurchaseSummaryResource
from .stock import StockMovementListResource, ClearStockMovementsResource
from .gradients import GradientListResource, ClearGradientsResource
from .messages import MessageListResource, MessageResource, ClearMessagesResource
# from .dashboard import CEODashboardResource, SellerDashboardResource, PurchaserDashboardResource, StorekeeperDashboardResource
from resources.dashboard import (
    CEODashboardResource,
    SellerDashboardResource,
    PurchaserDashboardResource,
    StorekeeperDashboardResource
)

# Create blueprint & API
api_bp = Blueprint('api', __name__)
api = Api(api_bp)

# ----------- AUTHENTICATION ROUTES -----------
api.add_resource(LoginResource, '/auth/login')
# api.add_resource(RefreshTokenResource, '/auth/refresh')
api.add_resource(MeResource, '/auth/me')

# ----------- USER MANAGEMENT -----------
api.add_resource(UserListResource, '/users')
api.add_resource(UserResource, '/users/<int:user_id>')
api.add_resource(UserSalaryResource, '/users/<int:user_id>/salary')
api.add_resource(UserPaymentResource, '/users/<int:user_id>/payment')

# ----------- INVENTORY -----------
api.add_resource(InventoryListResource, '/inventory')
api.add_resource(InventoryResource, '/inventory/<int:inv_id>')
api.add_resource(ClearInventoryResource, '/inventory/clear')

# ----------- STOCK MOVEMENTS -----------
api.add_resource(StockMovementListResource, '/stock-movements')
api.add_resource(ClearStockMovementsResource, '/stock-movements/clear')

# ----------- SALES -----------
api.add_resource(SalesListResource, '/sales')
api.add_resource(SalesResource, '/sales/<int:sale_id>')
api.add_resource(ClearSalesResource, '/sales/clear')
api.add_resource(SalesSummaryResource, '/sales/summary')

# ----------- PURCHASES -----------
api.add_resource(PurchaseListResource, '/purchases')
api.add_resource(PurchaseResource, '/purchases/<int:purchase_id>')
api.add_resource(ClearPurchasesResource, '/purchases/clear')
api.add_resource(PurchaseSummaryResource, '/purchases/summary')

# ----------- GRADIENTS -----------
api.add_resource(GradientListResource, '/gradients')
api.add_resource(ClearGradientsResource, '/gradients/clear')

# ----------- MESSAGES -----------
api.add_resource(MessageListResource, '/messages')
api.add_resource(MessageResource, '/messages/<int:message_id>')
api.add_resource(ClearMessagesResource, '/messages/clear')

# ----------- DASHBOARDS -----------
api.add_resource(CEODashboardResource, '/ceo/dashboard')
api.add_resource(SellerDashboardResource, '/seller/dashboard')
api.add_resource(PurchaserDashboardResource, '/purchaser/dashboard')
api.add_resource(StorekeeperDashboardResource, '/storekeeper/dashboard')

# ----------- CATCH-ALL (MUST BE LAST) -----------
@api_bp.route('/', defaults={'path': ''})
@api_bp.route('/<path:path>')
def catch_all(path):
    return jsonify({
        'success': False,
        'message': 'API endpoint not found',
        'error': 'not_found',
        'status_code': 404
    }), 404
