/**
 * Funciones de utilidad comunes para la interfaz web y consumo de la API REST
 */

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function badgeEstado(estado) {
    switch (estado) {
        case 'en_linea':
            return '<span class="badge bg-success"><i class="bi bi-circle-fill me-1 small"></i> En Línea</span>';
        case 'fuera_de_linea':
            return '<span class="badge bg-danger"><i class="bi bi-circle-fill me-1 small"></i> Fuera de Línea</span>';
        case 'advertencia':
            return '<span class="badge bg-warning text-dark"><i class="bi bi-exclamation-circle-fill me-1 small"></i> Advertencia</span>';
        default:
            return '<span class="badge bg-secondary"><i class="bi bi-question-circle me-1 small"></i> Desconocido</span>';
    }
}

function badgeGravedadClass(gravedad) {
    switch (gravedad) {
        case 'critica':
            return 'bg-danger';
        case 'alta':
            return 'bg-warning text-dark';
        case 'media':
            return 'bg-primary';
        case 'baja':
            return 'bg-secondary';
        default:
            return 'bg-light text-dark';
    }
}

function badgeEstadoIncidencia(estado) {
    switch (estado) {
        case 'abierta':
            return '<span class="badge bg-danger">Abierta</span>';
        case 'en_proceso':
            return '<span class="badge bg-warning text-dark">En Proceso</span>';
        case 'resuelta':
            return '<span class="badge bg-success">Resuelta</span>';
        default:
            return `<span class="badge bg-secondary">${estado}</span>`;
    }
}

// Verificación automática de salud de la API
document.addEventListener('DOMContentLoaded', async () => {
    const healthBadge = document.getElementById('apiHealthBadge');
    if (!healthBadge) return;

    try {
        const res = await fetch('/api/health');
        const data = await res.json();

        if (data.status === 'online' && data.database && data.database.connected) {
            healthBadge.className = 'badge bg-success';
            healthBadge.innerHTML = `<i class="bi bi-check-circle me-1"></i> API y DB Conectada`;
        } else {
            healthBadge.className = 'badge bg-warning text-dark';
            healthBadge.innerHTML = `<i class="bi bi-exclamation-triangle me-1"></i> DB Desconectada`;
            healthBadge.title = data.database?.message || 'Revise credenciales en .env';
        }
    } catch (e) {
        healthBadge.className = 'badge bg-danger';
        healthBadge.innerHTML = `<i class="bi bi-x-circle me-1"></i> API Inalcanzable`;
    }
});
