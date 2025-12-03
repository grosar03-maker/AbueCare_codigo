from django.db import models
from django.contrib.auth.models import User

class Recordatorio(models.Model):
    OPCIONES_ACTIVIDAD = [
        ('medicamento', 'Medicamento'),
        ('cita', 'Cita médica'),
        ('almuerzo', 'Almuerzo'),
        ('paseo', 'Paseo'),
        ('cena', 'Cena'),
    ]
    
    OPCIONES_FRECUENCIA = [
        ('una_vez', 'Una vez'),
        ('diario', 'Diario'),
        ('semanal', 'Semanal'),
    ]

    # Agregamos esto para cumplir con el punto de relacionar tablas (JOIN)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    actividad = models.CharField(max_length=32, choices=OPCIONES_ACTIVIDAD)
    fecha = models.DateField()
    hora = models.TimeField()
    notas = models.TextField(blank=True)
    frecuencia = models.CharField(max_length=20, choices=OPCIONES_FRECUENCIA, default='una_vez')
    alarma = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.actividad} - {self.fecha}"