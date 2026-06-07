let currentStep = 1;
let selectedTratamiento = null;
let selectedDuration = 30;
let selectedDate = null;
let selectedTime = null;

const allHorarios = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'];

function $(id) { return document.getElementById(id); }

function showStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
    currentStep = step;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.tratamiento-option').forEach(opt => {
    opt.addEventListener('click', () => {
        document.querySelectorAll('.tratamiento-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedTratamiento = opt.dataset.value;
        selectedDuration = parseInt(opt.dataset.duration);
        $('nextStep1').disabled = false;
    });
});

$('nextStep1').addEventListener('click', () => {
    if (!selectedTratamiento) {
        alert('Elegí un tratamiento');
        return;
    }
    const today = new Date().toISOString().split('T')[0];
    $('fecha').min = today;
    $('fecha').value = today;
    selectedDate = today;
    renderHorarios();
    showStep(2);
});

$('fecha').addEventListener('change', (e) => {
    selectedDate = e.target.value;
    renderHorarios();
});

function renderHorarios() {
    const container = $('horarios');
    const turnosGuardados = JSON.parse(localStorage.getItem('turnos') || '[]');
    const ocupados = turnosGuardados
        .filter(t => t.fecha === selectedDate && t.estado !== 'cancelado')
        .map(t => t.hora);
    container.innerHTML = allHorarios.map(h => {
        const ocupado = ocupados.includes(h);
        return `<div class="horario-option ${ocupado ? 'disabled' : ''}" data-time="${h}">${h}</div>`;
    }).join('');
    document.querySelectorAll('.horario-option:not(.disabled)').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.horario-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedTime = opt.dataset.time;
        });
    });
}

$('nextStep2').addEventListener('click', () => {
    if (!selectedDate) { alert('Elegí una fecha'); return; }
    if (!selectedTime) { alert('Elegí un horario'); return; }
    showStep(3);
});

$('nextStep3').addEventListener('click', () => {
    const nombre = $('nombre').value.trim();
    const telefono = $('telefono').value.trim();
    if (!nombre || !telefono) {
        alert('Completá nombre y teléfono');
        return;
    }
    renderResumen();
    showStep(4);
});

function renderResumen() {
    const fechaFormateada = new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    $('resumenTurno').innerHTML = `
        <div class="resumen__item"><span class="resumen__label">Tratamiento</span><span class="resumen__value">${selectedTratamiento}</span></div>
        <div class="resumen__item"><span class="resumen__label">Duración estimada</span><span class="resumen__value">${selectedDuration} minutos</span></div>
        <div class="resumen__item"><span class="resumen__label">Fecha</span><span class="resumen__value">${fechaFormateada}</span></div>
        <div class="resumen__item"><span class="resumen__label">Horario</span><span class="resumen__value">${selectedTime} hs</span></div>
        <div class="resumen__item"><span class="resumen__label">Paciente</span><span class="resumen__value">${$('nombre').value}</span></div>
        <div class="resumen__item"><span class="resumen__label">WhatsApp</span><span class="resumen__value">${$('telefono').value}</span></div>
    `;
}

document.querySelectorAll('[data-prev]').forEach(btn => {
    btn.addEventListener('click', () => showStep(currentStep - 1));
});

document.getElementById('turnoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const turno = {
        id: Date.now(),
        tratamiento: selectedTratamiento,
        duracion: selectedDuration,
        fecha: selectedDate,
        hora: selectedTime,
        nombre: $('nombre').value.trim(),
        telefono: $('telefono').value.trim(),
        email: $('email').value.trim(),
        obraSocial: $('obraSocial').value.trim(),
        notas: $('notas').value.trim(),
        estado: 'pendiente',
        creadoEn: new Date().toISOString()
    };
    const turnos = JSON.parse(localStorage.getItem('turnos') || '[]');
    turnos.push(turno);
    localStorage.setItem('turnos', JSON.stringify(turnos));
    const fechaFormateada = new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    $('mensajeExito').innerHTML = `Tu turno es el <strong>${fechaFormateada}</strong> a las <strong>${selectedTime} hs</strong> para <strong>${selectedTratamiento}</strong>.`;
    showStep(5);
});
