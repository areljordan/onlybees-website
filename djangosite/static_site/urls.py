from django.urls import path
from . import views

urlpatterns = [
    path('',          views.home,     name='home'),
    path('services/', views.services, name='services'),
    path('login/',    views.login_view,  name='login'),
    path('signup/',   views.signup_view, name='signup'),
    path('logout/',   views.logout_view, name='logout'),
    path('profile/',  views.profile,  name='profile'),
    path('checkout/', views.checkout, name='checkout'),
]