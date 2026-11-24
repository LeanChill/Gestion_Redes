(function () {
    'use strict';
    var App = window.App;
    var incidents = [];
    var incidentModal;
    var incidentsPreview = false;
    var devicesPreview = false;
    var sampleDevices = [
        { id: 1, nombre: 'Switch principal', ip: '192.168.1.10' },
        { id: 2, nombre: 'Router de acceso', ip: '192.168.1.1' },
        { id: 3, nombre: 'Firewall perimetral', ip: '192.168.1.2' }
    ];
    var sampleIncidents = [
        { id: 301, dispositivo_id: 2, dispositivo_nombre: 'Router de acceso', dispositivo_ip: '192.168.1.1', titulo: 'Conectividad intermitente', descripcion: 'Se detectan cortes breves en la conexión.', gravedad: 'alta', estado: 'abierta', fecha_reporte: '2026-11-23 09:40:00', _preview: true },
        { id: 302, dispositivo_id: 3, dispositivo_nombre: 'Firewall perimetral', dispositivo_ip: '192.168.1.2', titulo: 'Regla de acceso pendiente', descripcion: 'Revisar la política solicitada por el equipo de redes.', gravedad: 'media', estado: 'en_proceso', fecha_reporte: '2026-11-22 15:10:00', _preview: true },
        { id: 303, dispositivo_id: 1, dispositivo_nombre: 'Switch principal', dispositivo_ip: '192.168.1.10', titulo: 'Revisión de puerto', descripcion: 'Puerto verificado y normalizado.', gravedad: 'baja', estado: 'resuelta', fecha_reporte: '2026-11-21 11:15:00', _preview: true }
    ];

    function updatePreviewMetrics() {
        var counts = {
            total: incidents.length,
            abiertas: incidents.filter(function (item) { return item.estado === 'abierta'; }).length,
            en_proceso: incidents.filter(function (item) { return item.estado === 'en_proceso'; }).length,
            resueltas: incidents.filter(function (item) { return item.estado === 'resuelta'; }).length
        };
        document.getElementById('incidentMetricTotal').textContent = counts.total;
        document.getElementById('incidentMetricOpen').textContent = counts.abiertas;
        document.getElementById('incidentMetricProgress').textContent = counts.en_proceso;
        document.getElementById('incidentMetricResolved').textContent = counts.resueltas;
    }

    async function loadMetrics() {
        try {
            var metrics = App.unwrap(await App.apiRequest('/api/incidencias/metricas'));
            document.getElementById('incidentMetricTotal').textContent = metrics.total == null ? '0' : metrics.total;
            document.getElementById('incidentMetricOpen').textContent = metrics.abiertas == null ? '0' : metrics.abiertas;
            document.getElementById('incidentMetricProgress').textContent = metrics.en_proceso == null ? '0' : metrics.en_proceso;
            document.getElementById('incidentMetricResolved').textContent = metrics.resueltas == null ? '0' : metrics.resueltas;
        } catch (error) {
            updatePreviewMetrics();
            App.showAlert('Vista previa: métricas de incidencias de ejemplo. ' + error.message, 'warning');
        }
    }

    function showRows() {
        var body = document.getElementById('incidentsTable');
        var filter = document.getElementById('incidentStatusFilter').value;
        var visible = incidents.filter(function (item) { return !filter || item.estado === filter; });
        if (!visible.length) {
            body.innerHTML = '<tr><td colspan="6"><div class="empty-state">No hay incidencias para mostrar.</div></td></tr>';
            return;
        }
        body.innerHTML = visible.map(function (item) {
            var deviceName = item.dispositivo_nombre || ('Dispositivo #' + item.dispositivo_id);
            var stateChoices = [
                ['abierta', 'Abierta'],
                ['en_proceso', 'En proceso'],
                ['resuelta', 'Resuelta']
            ];
            var options = stateChoices.map(function (choice) {
                return '<option value="' + choice[0] + '"' + (item.estado === choice[0] ? ' selected' : '') + '>' + choice[1] + '</option>';
            }).join('');
            return '<tr><td>#' + App.escapeHtml(item.id) + '</td><td><span class="device-name">' + App.escapeHtml(item.titulo || 'Sin título') + '</span><span class="secondary-line">' + App.escapeHtml(item.descripcion || '') + '</span></td>' +
                '<td>' + App.escapeHtml(deviceName) + '<span class="secondary-line">' + App.escapeHtml(item.dispositivo_ip || '') + '</span></td><td>' + App.priorityBadge(item.gravedad) + '</td>' +
                '<td><label class="visually-hidden" for="incidentState' + Number(item.id) + '">Cambiar estado de incidencia</label><select class="form-select form-select-sm incident-state-select" id="incidentState' + Number(item.id) + '" data-state-id="' + Number(item.id) + '">' + options + '</select></td>' +
                '<td>' + App.escapeHtml(App.formatDate(item.fecha_reporte)) + '</td></tr>';
        }).join('');
    }

    async function loadIncidents() {
        var body = document.getElementById('incidentsTable');
        body.innerHTML = '<tr><td colspan="6"><div class="loading-state"><span class="spinner-border spinner-border-sm me-2"></span>Cargando incidencias…</div></td></tr>';
        try {
            var result = App.unwrap(await App.apiRequest('/api/incidencias'));
            incidents = Array.isArray(result) ? result : [];
            incidentsPreview = false;
            showRows();
        } catch (error) {
            incidentsPreview = true;
            incidents = sampleIncidents.map(function (item) { return Object.assign({}, item); });
            updatePreviewMetrics();
            showRows();
            App.showAlert('Vista previa con incidencias de ejemplo. Los cambios son temporales y no se guardan en la base de datos. ' + error.message, 'warning');
        }
    }

    async function loadDevices() {
        var select = document.getElementById('incid_dis_id');
        try {
            var result = App.unwrap(await App.apiRequest('/api/dispositivos'));
            var devices = Array.isArray(result) ? result : [];
            devicesPreview = false;
            select.innerHTML = '<option value="">Selecciona un dispositivo</option>' + devices.map(function (device) {
                return '<option value="' + Number(device.id) + '">' + App.escapeHtml(device.nombre || ('Dispositivo #' + device.id)) + ' · ' + App.escapeHtml(device.ip || '') + '</option>';
            }).join('');
            if (!devices.length) select.innerHTML = '<option value="">Registra un dispositivo primero</option>';
        } catch (error) {
            devicesPreview = true;
            select.innerHTML = '<option value="">Selecciona un dispositivo</option>' + sampleDevices.map(function (device) {
                return '<option value="' + device.id + '">' + App.escapeHtml(device.nombre) + ' · ' + App.escapeHtml(device.ip) + '</option>';
            }).join('');
            App.showAlert('Vista previa: se muestran dispositivos de ejemplo. ' + error.message, 'warning');
        }
    }

    async function changeState(select) {
        var id = select.dataset.stateId;
        var previous = incidents.find(function (item) { return Number(item.id) === Number(id); });
        var oldState = previous ? previous.estado : '';
        select.disabled = true;
        if (incidentsPreview || (previous && previous._preview)) {
            if (previous) previous.estado = select.value;
            select.disabled = false;
            showRows();
            updatePreviewMetrics();
            App.showAlert('Vista previa: el estado se actualizó solo en esta sesión.', 'warning');
            return;
        }
        try {
            await App.apiRequest('/api/incidencias/' + encodeURIComponent(id) + '/estado', {
                method: 'PATCH',
                body: { estado: select.value }
            });
            App.showAlert('Estado actualizado correctamente.', 'success');
            await loadIncidents();
        } catch (error) {
            select.value = oldState;
            App.showAlert('No se pudo actualizar el estado: ' + error.message, 'danger');
        } finally {
            select.disabled = false;
        }
    }

    function resetForm() {
        document.getElementById('incidentForm').reset();
        document.getElementById('incid_stat').value = 'abierta';
        document.getElementById('incid_prioridad').value = 'MD';
    }

    async function saveIncident(event) {
        event.preventDefault();
        var form = event.currentTarget;
        if (!form.reportValidity()) return;
        var payload = {
            dispositivo_id: Number(document.getElementById('incid_dis_id').value),
            titulo: document.getElementById('incid_titulo').value.trim(),
            descripcion: document.getElementById('incid_desc').value.trim(),
            gravedad: { AL: 'alta', MD: 'media', BJ: 'baja' }[document.getElementById('incid_prioridad').value],
            estado: document.getElementById('incid_stat').value,
            incid_tipo: document.getElementById('incid_tipo').value.trim(),
            incid_origen: document.getElementById('incid_origen').value.trim()
        };
        if (incidentsPreview || devicesPreview) {
            var selected = document.getElementById('incid_dis_id');
            var deviceName = selected.options[selected.selectedIndex].text.split(' · ')[0];
            incidents.unshift(Object.assign({
                id: Date.now(),
                dispositivo_nombre: deviceName,
                dispositivo_ip: '',
                fecha_reporte: new Date().toISOString(),
                _preview: true
            }, payload));
            incidentModal.hide();
            showRows();
            updatePreviewMetrics();
            App.showAlert('Vista previa: la incidencia se añadió temporalmente; no fue guardada en la base de datos.', 'warning');
            return;
        }
        var button = document.getElementById('saveIncidentButton');
        button.disabled = true;
        try {
            await App.apiRequest('/api/incidencias', { method: 'POST', body: payload });
            incidentModal.hide();
            App.showAlert('Incidencia registrada correctamente.', 'success');
            await loadIncidents();
        } catch (error) {
            App.showAlert('No se pudo registrar la incidencia: ' + error.message, 'danger');
        } finally {
            button.disabled = false;
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        incidentModal = new bootstrap.Modal(document.getElementById('incidentModal'));
        document.getElementById('createIncidentButton').addEventListener('click', function () {
            resetForm();
            incidentModal.show();
        });
        document.getElementById('incidentForm').addEventListener('submit', saveIncident);
        document.getElementById('incidentsTable').addEventListener('change', function (event) {
            if (event.target.matches('select[data-state-id]')) changeState(event.target);
        });
        document.getElementById('incidentStatusFilter').addEventListener('change', showRows);
        document.getElementById('reloadIncidents').addEventListener('click', function () {
            loadIncidents();
            loadMetrics();
        });
        loadIncidents();
        loadMetrics();
        loadDevices();
    });
}());
