from rest_framework.permissions import BasePermission

class IsAdminOrProcurementManager(BasePermission):
    """
    Allows access only to users with 'admin' or 'procurement_manager' roles.
    """
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.role in ['admin', 'procurement_manager']