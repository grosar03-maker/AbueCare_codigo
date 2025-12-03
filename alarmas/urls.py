from django.urls import path
from alarmas import views

urlpatterns = [
    # Vistas principales
    path('', views.dashboard_view, name='dashboard'),
    path('registro/', views.registro_view, name='registro'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Vista para crear recordatorios (AJAX)
    path('crear-recordatorio/', views.recordatorio_create, name='recordatorio_create'),

    # NUEVA RUTA: Reporte SQL Manual (Para cumplir puntos 1, 2, 3, 4 y 16 de la rúbrica)
    path('reporte-sql/', views.reporte_sql_view, name='reporte_sql'),
]