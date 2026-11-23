(function () {
    'use strict';
    var App = window.App;
    var incidents = [];
    var incidentModal;

    async function loadMetrics() {
        try {
            var metrics = App.unwrap(await App.apiRequest('/api/incidencias/metricas'));
            document.getElementById('incidentMetricTotal').textContent = metrics.total == null ? '0' : metrics.total;
            document.getElementById('incidentMetricOpen').textContent = metrics.abiertas == null ? '0' : metrics.abiertas;
            document.getElementById('incidentMetricProgress').textContent = metrics.en_proceso == null ? '0' : metrics.en_proceso;
            document.getElementById('incidentMetricResolved').textContent = metrics.resueltas == null ? '0' : metrics.resueltas;
        } catch (error) {
            ['incidentMetricTotal', 'incidentMetricOpen', 'incidentMetricProgress', 'incidentMetricResolved'].forEach(function (id) {
                document.getElementById(id).textContent = '—';
            });
            App.showAlert('No fue posible cargar las métricas de incidencias: ' + error.message, 'warning');
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
            showRows();
        } catch (error) {
            body.innerHTML = '<tr><td colspan="6"><div class="empty-state">No se pudieron cargar las incidencias.</div></td></tr>';
            App.showAlert('Error al consultar incidencias: ' + error.message, 'warning');
        }
    }

    async function loadDevices() {
        var select = document.getElementById('incid_dis_id');
        try {
            var result = App.unwrap(await App.apiRequest('/api/dispositivos'));
            var devices = Array.isArray(result) ? result : [];
            select.innerHTML = '<option value="">Selecciona un dispositivo</option>' + devices.map(function (device) {
                return '<option value="' + Number(device.id) + '">' + App.escapeHtml(device.nombre || ('Dispositivo #' + device.id)) + ' · ' + App.escapeHtml(device.ip || '') + '</option>';
            }).join('');
            if (!devices.length) select.innerHTML = '<option value="">Registra un dispositivo primero</option>';
        } catch (error) {
            select.innerHTML = '<option value="">No se pudieron cargar dispositivos</option>';
            App.showAlert('No se pudieron cargar los dispositivos del selector: ' + error.message, 'warning');
        }
    }

    async function changeState(select) {
        var id = select.dataset.stateId;
        var previous = incidents.find(function (item) { return Number(item.id) === Number(id); });
        var oldState = previous ? previous.estado : '';
        select.disabled = true;
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
