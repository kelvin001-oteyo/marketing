from django.urls import path

from .views import AdminCustomerListView, MeView, RegisterView


urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),
    path(
        "me/",
        MeView.as_view(),
        name="me",
    ),
    path(
        "admin/customers/",
        AdminCustomerListView.as_view(),
        name="admin-customer-list",
    ),
]
