let filtroActual = 'todos';

function $(id) { return document.getElementById(id); }

function obtenerTurnos() {
    return JSON.parse(localStorage.getItem('turnos') || '[]');
}

function guardarTurnos(turnos) {
    localStorage.setItem('turnos', JSON.stringify(turnos));
}

function actualizarEstado(id, nuevoEstado) {
    const turnos = obtenerTurnos();
    const turno = turnos.find(t => t.id === id);
    if (turno) {
        turno.estado = nuevoEstado;
        guardarTurnos(turnos);
        render();
    }
}

function eliminarTurno(id) {
    if (!confirm('¿Eliminar este turno?')) return;
    const turnos = obtenerTurnos().filter(t => t.id !== id);
    guardarTurnos(turnos);
    render();
}

function render() {
    const turnos = obtenerTurnos();
    const filtrados = filtroActual === 'todos' ? turnos : turnos.filter(t => t.estado === filtroActual);
    const body = $('turnosBody');
    const empty = $('emptyState');
    if (filtrados.length === 0) {
        body.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        body.innerHTML = filtrados.map(t => {
            const fecha = new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            return `
                <tr>
                    <td><strong>${t.nombre}</strong>${t.obraSocial ? `<br><small style="color: var(--gray-500);">${t.obraSocial}</small>` : ''}</td>
                    <td>${t.tratamiento}</td>
                    <td>${fecha}<br><small style="color: var(--gray-500);">${t.hora} hs</small></td>
                    <td><a href="https://wa.me/${t.telefono.replace(/[^0-9]/g, '')}" target="_blank" style="color: var(--primary);">${t.telefono}</a>${t.email ? `<br><small style="color: var(--gray-500);">${t.email}</small>` : ''}</td>
                    <td><span class="estado-badge estado-${t.estado}">${t.estado}</span></td>
                    <td>
                        ${t.estado === 'pendiente' ? `<button class="action-btn action-btn--confirm" onclick="actualizarEstado(${t.id}, 'confirmado')">Confirmar</button>` : ''}
                        ${t.estado === 'confirmado' ? `<button class="action-btn action-btn--attend" onclick="actualizarEstado(${t.id}, 'atendido')">Atendido</button>` : ''}
                        ${t.estado !== 'cancelado' && t.estado !== 'atendido' ? `<button class="action-btn action-btn--cancel" onclick="actualizarEstado(${t.id}, 'cancelado')">Cancelar</button>` : ''}
                        <button class="action-btn" style="background: var(--gray-300); color: var(--gray-700);" onclick="eliminarTurno(${t.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    $('totalTurnos').textContent = turnos.length;
    $('pendientes').textContent = turnos.filter(t => t.estado === 'pendiente').length;
    $('confirmados').textContent = turnos.filter(t => t.estado === 'confirmado').length;
    $('atendidos').textContent = turnos.filter(t => t.estado === 'atendido').length;
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filtroActual = btn.dataset.filter;
        render();
    });
});

render();

const turnosDemo = [
    { id: 1, tratamiento: 'Limpieza dental', duracion: 30, fecha: new Date().toISOString().split('T')[0], hora: '10:00', nombre: 'María González', telefono: '+54 9 11 5555-1234', email: 'maria.g@gmail.com', obraSocial: 'OSDE', notas: '', estado: 'confirmado', creadoEn: new Date().toISOString() },
    { id: 2, tratamiento: 'Ortodoncia', duracion: 60, fecha: new Date(Date.now() + 86400000).toISOString().split('T')[0], hora: '16:00', nombre: 'Carlos Rodríguez', telefono: '+54 9 11 5555-5678', email: '', obraSocial: 'Swiss Medical', notas: 'Control mensual de brackets', estado: 'pendiente', creadoEn: new Date().toISOString() },
    { id: 3, tratamiento: 'Consulta general', duracion: 30, fecha: new Date(Date.now() + 172800000).toISOString().split('T')[0], hora: '11:30', nombre: 'Lucía Fernández', telefono: '+54 9 11 5555-9012', email: 'lucia.f@hotmail.com', obraSocial: 'Particular', notas: 'Dolor en muela superior derecha', estado: 'pendiente', creadoEn: new Date().toISOString() }
];

if (obtenerTurnos().length === 0) {
    guardarTurnos(turnosDemo);
    render();
}
