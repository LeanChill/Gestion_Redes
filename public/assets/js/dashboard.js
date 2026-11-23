(function () {
    'use strict';
    var App = window.App;

    function metricValue(value) {
        return value == null ? '0' : String(value);
    }

    async function loadDeviceMetrics() {
        try {
            var metrics = App.unwrap(await App.apiRequest('/api/dispositivos/metricas'));
            document.getElementById('metricDevices').textContent = metricValue(metrics.total);
            document.getElementById('metricOnline').textContent = metricValue(metrics.en_linea);
            document.getElementById('metricOffline').textContent = metricValue(metrics.fuera_de_linea);
        } catch (error) {
            App.showAlert('No fue posible cargar las métricas de dispositivos: ' + error.message, 'warning');
        }
    }

    async function loadIncidentMetrics() {
        try {
            var metrics = App.unwrap(await App.apiRequest('/api/incidencias/metricas'));
            document.getElementById('metricOpenIncidents').textContent = metricValue(metrics.abiertas);
        } catch (error) {
            App.showAlert('No fue posible cargar las métricas de incidencias: ' + error.message, 'warning');
        }
    }

    async function loadActivity() {
        var host = document.getElementById('recentActivity');
        try {
            var results = await Promise.all([
                App.apiRequest('/api/monitoreo/historial?limit=4'),
                App.apiRequest('/api/incidencias')
            ]);
            var monitor = App.unwrap(results[0]);
            var incidents = App.unwrap(results[1]);
            var activity = [];
            (Array.isArray(monitor) ? monitor : []).forEach(function (item) {
                activity.push({
                    title: (item.dispositivo_nombre || ('Dispositivo #' + item.dispositivo_id)) + ' · ' + (item.estado || 'Comprobación'),
                    detail: (item.latencia_ms == null ? 'Latencia no disponible' : item.latencia_ms + ' ms') + ' · ' + App.formatDate(item.fecha_monitoreo),
                    date: item.fecha_monitoreo,
                    kind: item.estado === 'en_linea' ? 'online' : (item.estado === 'fuera_de_linea' ? 'offline' : '')
                });
            });
            (Array.isArray(incidents) ? incidents.slice(0, 3) : []).forEach(function (item) {
                activity.push({
                    title: 'Incidencia: ' + (item.titulo || 'Sin título'),
                    detail: (item.dispositivo_nombre || ('Dispositivo #' + item.dispositivo_id)) + ' · ' + (item.estado || '') + ' · ' + App.formatDate(item.fecha_reporte),
                    date: item.fecha_reporte,
                    kind: 'incident'
                });
            });
            activity.sort(function (a, b) {
                var dateA = new Date(String(a.date || '').replace(' ', 'T')).getTime() || 0;
                var dateB = new Date(String(b.date || '').replace(' ', 'T')).getTime() || 0;
                return dateB - dateA;
            });
            activity = activity.slice(0, 6);
            if (!activity.length) {
                host.innerHTML = '<div class="empty-state">Todavía no hay actividad registrada.</div>';
                return;
            }
            host.innerHTML = activity.map(function (item) {
                return '<div class="activity-item"><span class="activity-dot ' + item.kind + '"></span><div><strong>' +
                    App.escapeHtml(item.title) + '</strong><small>' + App.escapeHtml(item.detail) + '</small></div></div>';
            }).join('');
        } catch (error) {
            host.innerHTML = '<div class="empty-state">No se pudo cargar la actividad. ' + App.escapeHtml(error.message) + '</div>';
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        loadDeviceMetrics();
        loadIncidentMetrics();
        loadActivity();
    });
}());
