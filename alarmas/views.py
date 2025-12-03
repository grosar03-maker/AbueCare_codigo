from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db import connection
from .models import Recordatorio

# --- AUTENTICACIÓN ---

def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
        
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, 'Credenciales inválidas')
    
    return render(request, 'alarmas/login.html')

def registro_view(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        apellido = request.POST.get('apellido')
        email = request.POST.get('email')
        contraseña = request.POST.get('contraseña')
        confirmar = request.POST.get('confirmar_contraseña')

        if contraseña != confirmar:
            messages.error(request, 'Las contraseñas no coinciden')
            return redirect('registro')
        
        if User.objects.filter(username=email).exists():
            messages.error(request, 'El correo ya existe')
            return redirect('registro')

        User.objects.create_user(
            username=email, 
            email=email, 
            password=contraseña,
            first_name=nombre,
            last_name=apellido
        )
        messages.success(request, 'Cuenta creada. Inicia sesión.')
        return redirect('login')

    return render(request, 'alarmas/registro.html')

def logout_view(request):
    logout(request)
    return redirect('login')

# --- VISTAS PRINCIPALES ---

@login_required
def dashboard_view(request):
    mis_alarmas = Recordatorio.objects.filter(usuario=request.user).order_by('fecha', 'hora')
    context = {
        'nombre_saludo': request.user.first_name or request.user.username,
        'alarmas': mis_alarmas
    }
    return render(request, 'alarmas/dashboard.html', context)

@login_required
def recordatorio_create(request):
    if request.method == 'POST':
        try:
            Recordatorio.objects.create(
                usuario=request.user,
                actividad=request.POST.get('actividad'),
                fecha=request.POST.get('fecha'),
                hora=request.POST.get('hora'),
                notas=request.POST.get('notas', ''),
                frecuencia=request.POST.get('frecuencia', 'una_vez'),
                alarma=request.POST.get('alarma') == 'on'
            )
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Método no permitido'})

@login_required
def recordatorio_edit(request, id):
    rec = get_object_or_404(Recordatorio, id=id, usuario=request.user)
    if request.method == 'POST':
        try:
            rec.actividad = request.POST.get('actividad')
            rec.fecha = request.POST.get('fecha')
            rec.hora = request.POST.get('hora')
            rec.notas = request.POST.get('notas', '')
            rec.frecuencia = request.POST.get('frecuencia')
            rec.alarma = request.POST.get('alarma') == 'on'
            rec.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Método no permitido'})

# --- NUEVA VISTA: ELIMINAR ---
@login_required
def recordatorio_delete(request, id):
    # Buscamos el recordatorio asegurando que sea del usuario logueado
    rec = get_object_or_404(Recordatorio, id=id, usuario=request.user)
    
    if request.method == 'POST':
        try:
            rec.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
            
    return JsonResponse({'success': False, 'error': 'Método no permitido'})

# --- REPORTE SQL MANUAL ---
@login_required
def reporte_sql_view(request):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT u.first_name, r.actividad, r.fecha 
            FROM alarmas_recordatorio r
            INNER JOIN auth_user u ON r.usuario_id = u.id
            WHERE r.alarma = 1
            ORDER BY r.fecha DESC
        """)
        resultados = cursor.fetchall()
    return render(request, 'alarmas/reporte.html', {'data': resultados})