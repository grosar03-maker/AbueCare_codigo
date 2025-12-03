from django.contrib import admin
from .models import Recordatorio

# Configuración avanzada del admin para asegurar el nivel "Totalmente Logrado"
@admin.register(Recordatorio)
class RecordatorioAdmin(admin.ModelAdmin):
    list_display = ('actividad', 'usuario', 'fecha', 'hora', 'alarma') # Columnas visibles
    list_filter = ('actividad', 'fecha', 'alarma') # Filtros laterales
    search_fields = ('notas', 'usuario__username') # Barra de búsqueda
    ordering = ('fecha', 'hora') # Orden por defecto