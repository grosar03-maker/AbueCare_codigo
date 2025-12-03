// --- MODALES AUTH (Login/Registro) ---
function abrirRegistro(event) {
	if(event) event.preventDefault();
	const m = document.getElementById('modalRegistro');
    if(m) m.style.display = 'block';
}
function cerrarRegistro() {
	const m = document.getElementById('modalRegistro');
    if(m) m.style.display = 'none';
}
function abrirLogin(event) {
	if(event) event.preventDefault();
	const m = document.getElementById('modalLogin');
    if(m) m.style.display = 'block';
}
function cerrarLogin() {
	const m = document.getElementById('modalLogin');
    if(m) m.style.display = 'none';
}

// --- LOGICA DE RECORDATORIOS (Crear y Editar) ---

function abrirRecordatorio(event, urlCrear) {
    if (event) event.preventDefault();
    
    const modal = document.getElementById('modalRecordatorio');
    const form = document.getElementById('formRecordatorio');
    const titulo = modal.querySelector('.modal-title');
    
    form.reset();
    form.action = urlCrear || '/crear-recordatorio/';
    
    titulo.textContent = '📌 Nuevo recordatorio';
    form.querySelector('button[type="submit"]').textContent = '💾 Guardar recordatorio';
    form.querySelector('input[name="alarma"]').checked = true;

    modal.style.display = 'block';
}

function editarRecordatorio(btn) {
    const modal = document.getElementById('modalRecordatorio');
    const form = document.getElementById('formRecordatorio');
    const titulo = modal.querySelector('.modal-title');
    
    const data = btn.dataset;

    form.actividad.value = data.actividad;
    form.fecha.value = data.fecha;
    form.hora.value = data.hora;
    form.notas.value = data.notas;
    form.frecuencia.value = data.frecuencia;
    form.alarma.checked = (data.alarma === 'true');

    form.action = data.url;

    titulo.textContent = '✏️ Editar recordatorio';
    form.querySelector('button[type="submit"]').textContent = '🔄 Actualizar cambios';

    modal.style.display = 'block';
}

// --- NUEVA FUNCIÓN: ELIMINAR ---
function eliminarRecordatorio(url) {
    if(!confirm('¿Estás seguro de que quieres eliminar este recordatorio?')) {
        return;
    }

    // Obtenemos el token CSRF de cualquier formulario de la página
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(url, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrfToken
        }
    })
    .then(resp => resp.json())
    .then(data => {
        if(data.success) {
            // Recargamos para que desaparezca la tarjeta
            window.location.reload();
        } else {
            alert('Error al eliminar: ' + (data.error || 'Desconocido'));
        }
    })
    .catch(err => {
        console.error(err);
        alert('Error de red al intentar eliminar');
    });
}

function cerrarRecordatorio() {
    document.getElementById('modalRecordatorio').style.display = 'none';
}

window.addEventListener('click', function(e) {
	const modalR = document.getElementById('modalRegistro');
	const modalL = document.getElementById('modalLogin');
    const modalRec = document.getElementById('modalRecordatorio');
    
	if (modalR && e.target === modalR) modalR.style.display = 'none';
	if (modalL && e.target === modalL) modalL.style.display = 'none';
    if (modalRec && e.target === modalRec) modalRec.style.display = 'none';
});

// --- ENVIO DE FORMULARIOS ---
document.addEventListener('DOMContentLoaded', function() {
	const formReg = document.getElementById('formRegistro');
	if (formReg) {
		formReg.addEventListener('submit', function(e) {
			const pwd = formReg.querySelector('input[name=contraseña]').value;
			const pwd2 = formReg.querySelector('input[name=confirmar_contraseña]').value;
			if (pwd.length < 6) { e.preventDefault(); alert('Mínimo 6 caracteres'); return false; }
			if (pwd !== pwd2) { e.preventDefault(); alert('Las contraseñas no coinciden'); return false; }
		});
	}

	const formLog = document.getElementById('formLogin');
	if (formLog) {
		formLog.addEventListener('submit', function(e) {
			const user = formLog.querySelector('input[name=username]').value.trim();
			const pwd = formLog.querySelector('input[name=password]').value;
			if (!user || !pwd) { e.preventDefault(); alert('Complete todos los campos'); return false; }
		});
	}

	const formRec = document.getElementById('formRecordatorio');
	if (formRec) {
		formRec.addEventListener('submit', function(e) {
			e.preventDefault();
			const url = formRec.action;
			const formData = new FormData(formRec);
            const urlFinal = url || '/crear-recordatorio/';

			fetch(urlFinal, {
				method: 'POST',
				headers: {'X-Requested-With': 'XMLHttpRequest'},
				body: formData
			})
			.then(resp => resp.json())
			.then(data => {
				const mensajes = document.getElementById('recMensajes');
				if (data.success) {
					mensajes.innerHTML = '<div class="msg success">Guardado exitosamente ✓</div>';
					setTimeout(() => { window.location.reload(); }, 1000);
				} else {
					mensajes.innerHTML = '<div class="msg error">Error: ' + (data.error || 'desconocido') + '</div>';
				}
			})
			.catch(err => {
				console.error(err);
                const mensajes = document.getElementById('recMensajes');
                if(mensajes) mensajes.innerHTML = '<div class="msg error">Error de red</div>';
			});
		});
	}
});