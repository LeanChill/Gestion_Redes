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
            document.getElementById('metricDevices').textContent = '7';
            document.getElementById('metricOnline').textContent = '5';
            document.getElementById('metricOffline').textContent = '1';
            App.showAlert('Vista previa: métricas de dispositivos de ejemplo. ' + error.message, 'warning');
        }
    }

    async function loadIncidentMetrics() {
        try {
            var metrics = App.unwrap(await App.apiRequest('/api/incidencias/metricas'));
            document.getElementById('metricOpenIncidents').textContent = metricValue(metrics.abiertas);
        } catch (error) {
            document.getElementById('metricOpenIncidents').textContent = '2';
            App.showAlert('Vista previa: métricas de incidencias de ejemplo. ' + error.message, 'warning');
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
            host.innerHTML = [
                ['online', 'Switch principal · en_linea', '8 ms · Ejemplo de actividad'],
                ['incident', 'Incidencia: Conectividad intermitente', 'Router de acceso · abierta · Ejemplo'],
                ['offline', 'Firewall perimetral · fuera_de_linea', 'Latencia no disponible · Ejemplo']
            ].map(function (item) {
                return '<div class="activity-item"><span class="activity-dot ' + item[0] + '"></span><div><strong>' +
                    App.escapeHtml(item[1]) + '</strong><small>' + App.escapeHtml(item[2]) + '</small></div></div>';
            }).join('');
            App.showAlert('Vista previa: actividad de ejemplo. ' + error.message, 'warning');
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        loadDeviceMetrics();
        loadIncidentMetrics();
        loadActivity();
    });
}());
