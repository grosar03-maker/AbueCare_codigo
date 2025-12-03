/**
 * ==========================================
 * 🧠 LÓGICA PRINCIPAL DE ABUECARE (MAIN.JS)
 * ==========================================
 * Este archivo gestiona:
 * 1. La apertura y cierre de ventanas modales.
 * 2. El llenado de formularios para Crear y Editar.
 * 3. El envío de datos al servidor sin recargar (AJAX/Fetch).
 * 4. La eliminación de registros con seguridad CSRF.
 */

// ==========================================
// 1. FUNCIONES PARA GESTIÓN DE RECORDATORIOS
// ==========================================

/**
 * Función: abrirRecordatorio (Modo CREAR)
 * ---------------------------------------
 * Se ejecuta cuando pulsas el botón "➕ Nuevo recordatorio".
 * @param {Event} event - El evento del click (para evitar que el enlace recargue).
 * @param {String} urlCrear - La dirección donde se guardará el nuevo dato.
 */
function abrirRecordatorio(event, urlCrear) {
    if (event) event.preventDefault(); // Evita que el enlace te lleve arriba de la página
    console.log("--> Abriendo modal en modo CREAR");

    // Obtenemos los elementos del HTML
    const modal = document.getElementById('modalRecordatorio');
    const form = document.getElementById('formRecordatorio');
    const titulo = modal.querySelector('.modal-title');
    
    // PASO 1: Limpiar el formulario (borrar datos viejos)
    form.reset();
    
    // PASO 2: Configurar la URL de destino
    // Si por error no llega la urlCrear, usamos una por defecto para evitar fallos.
    form.action = urlCrear || '/crear-recordatorio/';
    
    // PASO 3: Cambiar los textos para que diga "Nuevo" y "Guardar"
    titulo.textContent = '📌 Nuevo recordatorio';
    form.querySelector('button[type="submit"]').textContent = '💾 Guardar recordatorio';
    
    // PASO 4: Encender el switch de "Alarma Activa" por defecto
    const switchAlarma = form.querySelector('input[name="alarma"]');
    if(switchAlarma) switchAlarma.checked = true;

    // PASO 5: Mostrar el modal
    modal.style.display = 'block';
}

/**
 * Función: editarRecordatorio (Modo EDITAR)
 * ----------------------------------------
 * Se ejecuta al pulsar el botón gris "✏️" en una tarjeta.
 * @param {HTMLButtonElement} btn - El botón que fue presionado (contiene los datos).
 */
function editarRecordatorio(btn) {
    console.log("--> Abriendo modal en modo EDITAR");
    
    const modal = document.getElementById('modalRecordatorio');
    const form = document.getElementById('formRecordatorio');
    const titulo = modal.querySelector('.modal-title');
    
    // PASO 1: Leer los datos ocultos (data-attributes) del botón
    const data = btn.dataset;
    console.log("Datos recuperados:", data); // Para depuración

    // PASO 2: Rellenar los campos del formulario con esos datos
    if(form.actividad) form.actividad.value = data.actividad;
    if(form.fecha) form.fecha.value = data.fecha;
    if(form.hora) form.hora.value = data.hora;
    if(form.notas) form.notas.value = data.notas;
    if(form.frecuencia) form.frecuencia.value = data.frecuencia;
    
    // El checkbox se marca si el valor es 'true'
    if(form.alarma) form.alarma.checked = (data.alarma === 'true');

    // PASO 3: Cambiar la URL de destino a la de EDICIÓN (importante)
    form.action = data.url;

    // PASO 4: Cambiar textos visuales para indicar edición
    titulo.textContent = '✏️ Editar recordatorio';
    form.querySelector('button[type="submit"]').textContent = '🔄 Actualizar cambios';

    // PASO 5: Mostrar el modal
    modal.style.display = 'block';
}

/**
 * Función: eliminarRecordatorio
 * -----------------------------
 * Se ejecuta al pulsar el botón rojo "🗑️".
 * @param {String} url - La dirección específica para borrar ESE recordatorio.
 */
function eliminarRecordatorio(url) {
    console.log("--> Intentando eliminar registro en:", url);
    
    // PASO 1: Confirmación de seguridad
    if(!confirm('¿Estás seguro de que quieres eliminar este recordatorio?')) {
        return; // Si dice que no, cancelamos todo.
    }

    // PASO 2: Obtener el Token CSRF (Seguridad de Django)
    // Sin esto, Django rechaza la petición por seguridad.
    const form = document.getElementById('formRecordatorio');
    let csrfToken = '';
    
    // Buscamos el token dentro del formulario existente
    if (form) {
        const inputToken = form.querySelector('[name=csrfmiddlewaretoken]');
        if (inputToken) csrfToken = inputToken.value;
    }

    // Si no hay token, no podemos seguir
    if (!csrfToken) {
        alert("Error de seguridad: No se encontró el token CSRF.");
        return;
    }

    // PASO 3: Enviar la petición de borrado al servidor
    fetch(url, {
        method: 'POST', // Usamos POST por seguridad
        headers: {
            'X-Requested-With': 'XMLHttpRequest', // Indica que es AJAX
            'X-CSRFToken': csrfToken // Adjuntamos la llave de seguridad
        }
    })
    .then(resp => resp.json()) // Convertimos la respuesta a JSON
    .then(data => {
        if(data.success) {
            // ÉXITO: Recargamos la página para que desaparezca la tarjeta
            window.location.reload();
        } else {
            // ERROR: Mostramos qué pasó
            alert('Error al eliminar: ' + (data.error || 'Desconocido'));
        }
    })
    .catch(err => {
        console.error("Error en fetch:", err);
        alert('Error de conexión al intentar eliminar');
    });
}

// ==========================================
// 2. UTILIDADES DE MODALES (Cerrar / Auth)
// ==========================================

// Cierra el modal de recordatorios
function cerrarRecordatorio() {
    document.getElementById('modalRecordatorio').style.display = 'none';
}

// Funciones para Login y Registro
function abrirRegistro(event) {
	if(event) event.preventDefault();
	document.getElementById('modalRegistro').style.display = 'block';
}
function cerrarRegistro() {
	document.getElementById('modalRegistro').style.display = 'none';
}
function abrirLogin(event) {
	if(event) event.preventDefault();
	document.getElementById('modalLogin').style.display = 'block';
}
function cerrarLogin() {
	document.getElementById('modalLogin').style.display = 'none';
}

// CERRAR AL CLICKEAR FUERA DEL MODAL (UX)
window.addEventListener('click', function(e) {
	const modalR = document.getElementById('modalRegistro');
	const modalL = document.getElementById('modalLogin');
    const modalRec = document.getElementById('modalRecordatorio');
    
    // Si el click fue en el fondo oscuro (no en la tarjeta), cerramos.
	if (modalR && e.target === modalR) modalR.style.display = 'none';
	if (modalL && e.target === modalL) modalL.style.display = 'none';
    if (modalRec && e.target === modalRec) modalRec.style.display = 'none';
});

// ==========================================
// 3. EVENTOS AL CARGAR LA PÁGINA
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ Sistema ABUECARE cargado correctamente.");

	// --- MANEJO DEL FORMULARIO DE RECORDATORIO (AJAX) ---
    // Este bloque intercepta el envío del formulario para hacerlo sin recargar
	const formRec = document.getElementById('formRecordatorio');
    
	if (formRec) {
		formRec.addEventListener('submit', function(e) {
			e.preventDefault(); // 1. Detenemos el envío normal
			
            const url = formRec.action; // 2. Leemos a dónde va (Crear o Editar)
			const formData = new FormData(formRec); // 3. Empaquetamos los datos
            
            // Fallback de seguridad para la URL
            const urlFinal = url || '/crear-recordatorio/';

            // 4. Enviamos los datos por internet (Fetch)
			fetch(urlFinal, {
				method: 'POST',
				headers: {'X-Requested-With': 'XMLHttpRequest'},
				body: formData
			})
			.then(resp => resp.json()) // 5. Esperamos respuesta JSON
			.then(data => {
				const mensajes = document.getElementById('recMensajes');
				
                if (data.success) {
                    // ÉXITO
					if(mensajes) mensajes.innerHTML = '<div class="msg success">Guardado exitosamente ✓</div>';
					
                    // Recargamos la página en 0.5 segundos para ver el cambio
                    setTimeout(() => { window.location.reload(); }, 500);
				} else {
                    // ERROR
					if(mensajes) mensajes.innerHTML = '<div class="msg error">Error: ' + (data.error || 'desconocido') + '</div>';
				}
			})
			.catch(err => {
                // ERROR DE RED
				console.error(err);
                const mensajes = document.getElementById('recMensajes');
                if(mensajes) mensajes.innerHTML = '<div class="msg error">Error de red</div>';
			});
		});
	}
    
    // --- VALIDACIONES SIMPLES PARA REGISTRO Y LOGIN ---
    
    // Registro: Verificar contraseñas
	const formReg = document.getElementById('formRegistro');
	if (formReg) {
		formReg.addEventListener('submit', function(e) {
			const pwd = formReg.querySelector('input[name=contraseña]').value;
			const pwd2 = formReg.querySelector('input[name=confirmar_contraseña]').value;
			if (pwd.length < 6) { e.preventDefault(); alert('Mínimo 6 caracteres'); return false; }
			if (pwd !== pwd2) { e.preventDefault(); alert('Las contraseñas no coinciden'); return false; }
		});
	}

    // Login: Verificar campos vacíos
	const formLog = document.getElementById('formLogin');
	if (formLog) {
		formLog.addEventListener('submit', function(e) {
			const user = formLog.querySelector('input[name=username]').value.trim();
			const pwd = formLog.querySelector('input[name=password]').value;
			if (!user || !pwd) { e.preventDefault(); alert('Complete todos los campos'); return false; }
		});
	}
});
