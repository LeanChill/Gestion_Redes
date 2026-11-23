(function () {
    'use strict';
    var App = window.App;
    var devices = [];
    var rows = [];

    function showRows() {
        var body = document.getElementById('monitorTable');
        if (!rows.length) {
            body.innerHTML = '<tr><td colspan="8"><div class="empty-state">No hay registros de monitoreo.</div></td></tr>';
            return;
        }
        body.innerHTML = rows.map(function (row) {
            var deviceName = row.dispositivo_nombre || devices.filter(function (device) {
                return Number(device.id) === Number(row.dispositivo_id);
            }).map(function (device) { return device.nombre; })[0] || ('Dispositivo #' + row.dispositivo_id);
            var state = row.estado || row.mon_conexion;
            var cpu = row.mon_ucpu == null ? '—' : row.mon_ucpu + '%';
            var memory = row.mon_umem == null ? '—' : row.mon_umem + '%';
            var latency = row.latencia_ms == null ? row.mon_latencia : row.latencia_ms;
            var date = row.fecha_monitoreo || row.mon_fec;
            var id = Number(row.id || row.mon_id);
            return '<tr><td>' + App.escapeHtml(row.id || row.mon_id || '—') + '</td><td><span class="device-name">' + App.escapeHtml(deviceName) + '</span><span class="secondary-line">ID ' + App.escapeHtml(row.dispositivo_id || row.dis_id) + '</span></td>' +
                '<td>' + App.connectionBadge(state) + '</td><td>' + App.escapeHtml(latency == null ? '—' : latency + ' ms') + '</td><td>' + App.escapeHtml(cpu) + '</td><td>' + App.escapeHtml(memory) + '</td><td>' + App.escapeHtml(App.formatDate(date)) + '</td>' +
                '<td class="text-end"><button class="btn btn-sm btn-light" data-ping-id="' + Number(row.dispositivo_id || row.dis_id) + '" title="Comprobar ahora" aria-label="Comprobar ahora"><i class="bi bi-arrow-repeat"></i></button></td></tr>';
        }).join('');
    }

    async function loadDevices() {
        try {
            var result = App.unwrap(await App.apiRequest('/api/dispositivos'));
            devices = Array.isArray(result) ? result : [];
            var select = document.getElementById('monitorDeviceFilter');
            select.innerHTML = '<option value="">Todos los dispositivos</option>' + devices.map(function (device) {
                return '<option value="' + Number(device.id) + '">' + App.escapeHtml(device.nombre || ('Dispositivo #' + device.id)) + '</option>';
            }).join('');
        } catch (error) {
            App.showAlert('No se pudieron cargar los dispositivos para el filtro: ' + error.message, 'warning');
        }
    }

    async function loadHistory() {
        var id = document.getElementById('monitorDeviceFilter').value;
        var body = document.getElementById('monitorTable');
        body.innerHTML = '<tr><td colspan="8"><div class="loading-state"><span class="spinner-border spinner-border-sm me-2"></span>Cargando historial…</div></td></tr>';
        try {
            var url = id ? '/api/monitoreo/dispositivo/' + encodeURIComponent(id) : '/api/monitoreo/historial';
            var result = App.unwrap(await App.apiRequest(url));
            rows = Array.isArray(result) ? result : [];
            showRows();
        } catch (error) {
            body.innerHTML = '<tr><td colspan="8"><div class="empty-state">No se pudo cargar el historial.</div></td></tr>';
            App.showAlert('Error al consultar el historial: ' + error.message, 'warning');
        }
    }

    async function runPing(url, button, successMessage) {
        if (button) button.disabled = true;
        try {
            var result = App.unwrap(await App.apiRequest(url, { method: 'POST' }));
            var message = result && result.total_verificados != null
                ? 'Comprobación completada: ' + result.total_verificados + ' dispositivos verificados.'
                : successMessage;
            App.showAlert(message, 'success');
            await loadHistory();
        } catch (error) {
            App.showAlert('No se pudo completar el monitoreo: ' + error.message, 'danger');
        } finally {
            if (button) button.disabled = false;
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('pingAllButton').addEventListener('click', function (event) {
            runPing('/api/monitoreo/ping-all', event.currentTarget, 'Comprobación general completada.');
        });
        document.getElementById('reloadMonitor').addEventListener('click', loadHistory);
        document.getElementById('monitorDeviceFilter').addEventListener('change', loadHistory);
        document.getElementById('monitorTable').addEventListener('click', function (event) {
            var button = event.target.closest('button[data-ping-id]');
            if (button) runPing('/api/monitoreo/ping/' + encodeURIComponent(button.dataset.pingId), button, 'Comprobación del dispositivo completada.');
        });
        loadDevices().then(loadHistory);
    });
}());
