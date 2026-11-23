(function () {
    'use strict';

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function showAlert(message, type, target) {
        var host = target || document.getElementById('globalAlerts');
        if (!host) return;
        host.innerHTML = '<div class="alert alert-' + escapeHtml(type || 'danger') + ' alert-dismissible fade show" role="alert">' +
            escapeHtml(message) + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button></div>';
    }

    async function apiRequest(url, options) {
        var requestOptions = Object.assign({ headers: { Accept: 'application/json' } }, options || {});
        if (requestOptions.body && typeof requestOptions.body !== 'string') {
            requestOptions.headers = Object.assign({}, requestOptions.headers, { 'Content-Type': 'application/json' });
            requestOptions.body = JSON.stringify(requestOptions.body);
        }

        var response;
        try {
            response = await fetch(url, requestOptions);
        } catch (error) {
            throw new Error('No se pudo conectar con la API. Comprueba que el servidor esté disponible.');
        }

        var payload;
        try {
            payload = await response.json();
        } catch (error) {
            throw new Error('La API devolvió una respuesta no válida. Inténtalo de nuevo más tarde.');
        }

        if (!response.ok || payload.success === false) {
            throw new Error(payload.message || 'No se pudo completar la solicitud (' + response.status + ').');
        }
        return payload;
    }

    function unwrap(payload) {
        return payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
    }

    function formatDate(value) {
        if (!value) return '—';
        var date = new Date(String(value).replace(' ', 'T'));
        return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('es');
    }

    function connectionBadge(state) {
        var values = {
            en_linea: ['success', 'En línea'],
            fuera_de_linea: ['danger', 'Fuera de línea'],
            advertencia: ['warning text-dark', 'Advertencia'],
            desconocido: ['secondary', 'Desconocido'],
            '1': ['success', 'Activo'],
            '0': ['secondary', 'Inactivo'],
            M: ['warning text-dark', 'Mantenimiento']
        };
        var badge = values[String(state)] || ['secondary', String(state || 'Sin estado')];
        return '<span class="badge text-bg-' + badge[0] + '">' + escapeHtml(badge[1]) + '</span>';
    }

    function incidentStatusBadge(state) {
        var values = {
            abierta: ['danger', 'Abierta'],
            en_proceso: ['warning text-dark', 'En proceso'],
            resuelta: ['success', 'Resuelta']
        };
        var badge = values[String(state)] || ['secondary', String(state || 'Sin estado')];
        return '<span class="badge text-bg-' + badge[0] + '">' + escapeHtml(badge[1]) + '</span>';
    }

    function priorityBadge(value) {
        var normalized = String(value || '').toLowerCase();
        var values = {
            alta: ['danger', 'Alta'], critica: ['danger', 'Crítica'], al: ['danger', 'Alta'],
            media: ['warning text-dark', 'Media'], md: ['warning text-dark', 'Media'],
            baja: ['secondary', 'Baja'], bj: ['secondary', 'Baja']
        };
        var badge = values[normalized] || ['secondary', String(value || '—')];
        return '<span class="badge text-bg-' + badge[0] + '">' + escapeHtml(badge[1]) + '</span>';
    }

    async function checkHealth() {
        var badge = document.getElementById('apiHealthBadge');
        if (!badge) return;
        try {
            var response = await fetch('/api/health', { headers: { Accept: 'application/json' } });
            var health = await response.json();
            if (!response.ok || health.status !== 'online') throw new Error('API no disponible');

            if (health.database && health.database.connected) {
                badge.className = 'badge rounded-pill text-bg-success health-badge';
                badge.innerHTML = '<i class="bi bi-check-circle me-1"></i>API y base de datos';
                badge.removeAttribute('title');
            } else {
                badge.className = 'badge rounded-pill text-bg-warning health-badge';
                badge.innerHTML = '<i class="bi bi-exclamation-triangle me-1"></i>Base de datos desconectada';
                badge.title = health.database && health.database.message ? health.database.message : 'La base de datos no está disponible.';
            }
        } catch (error) {
            badge.className = 'badge rounded-pill text-bg-danger health-badge';
            badge.innerHTML = '<i class="bi bi-x-circle me-1"></i>API inaccesible';
            badge.title = error.message || 'No fue posible consultar el estado del servicio.';
        }
    }

    window.App = {
        apiRequest: apiRequest,
        unwrap: unwrap,
        escapeHtml: escapeHtml,
        showAlert: showAlert,
        formatDate: formatDate,
        connectionBadge: connectionBadge,
        incidentStatusBadge: incidentStatusBadge,
        priorityBadge: priorityBadge
    };

    document.addEventListener('DOMContentLoaded', checkHealth);
}());
