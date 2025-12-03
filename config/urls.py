from django.contrib import admin
from django.urls import path
from alarmas import views

urlpatterns = [
    # Panel de Administración
    path('admin/', admin.site.urls),

    # Vistas de Auth y Dashboard
    path('', views.dashboard_view, name='dashboard'),
    path('registro/', views.registro_view, name='registro'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Operaciones AJAX (Crear, Editar y Eliminar)
    path('crear-recordatorio/', views.recordatorio_create, name='recordatorio_create'),
    path('editar-recordatorio/<int:id>/', views.recordatorio_edit, name='recordatorio_edit'),
    path('eliminar-recordatorio/<int:id>/', views.recordatorio_delete, name='recordatorio_delete'),

    # Reporte Especial SQL
    path('reporte-sql/', views.reporte_sql_view, name='reporte_sql'),
]
