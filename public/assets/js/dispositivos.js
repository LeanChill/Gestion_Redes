(function () {
    'use strict';
    var App = window.App;
    var deviceModal;
    var incidentsModal;
    var devices = [];
    var types = { RT: 'Router', SW: 'Switch', SV: 'Servidor', AP: 'Access Point', PC: 'Host/PC' };

    function valueOf(item, primary, fallback) {
        return item[primary] == null ? (fallback ? item[fallback] : '') : item[primary];
    }

    function showRows() {
        var body = document.getElementById('devicesTable');
        if (!devices.length) {
            body.innerHTML = '<tr><td colspan="6"><div class="empty-state">No hay dispositivos registrados.</div></td></tr>';
            return;
        }
        body.innerHTML = devices.map(function (device) {
            var id = Number(device.id);
            var name = valueOf(device, 'nombre', 'dis_nombre');
            var type = valueOf(device, 'tipo', 'dis_tipo');
            var status = valueOf(device, 'estado', 'dis_stat');
            return '<tr><td><span class="device-name">' + App.escapeHtml(name || 'Sin nombre') + '</span><span class="secondary-line">ID ' + App.escapeHtml(device.id) + '</span></td>' +
                '<td>' + App.escapeHtml(types[type] || type || '—') + '</td>' +
                '<td>' + App.escapeHtml(valueOf(device, 'ip', 'dis_ip')) + '<span class="secondary-line">' + App.escapeHtml(valueOf(device, 'mac', 'dis_mac') || 'MAC no registrada') + '</span></td>' +
                '<td>' + App.connectionBadge(status) + '</td><td>' + App.escapeHtml(App.formatDate(device.ultimo_monitoreo)) + '</td>' +
                '<td class="text-end"><div class="table-actions"><button class="btn btn-light btn-sm" data-action="incidents" data-id="' + id + '" title="Ver incidencias" aria-label="Ver incidencias"><i class="bi bi-exclamation-circle"></i></button>' +
                '<button class="btn btn-light btn-sm" data-action="edit" data-id="' + id + '" title="Editar" aria-label="Editar"><i class="bi bi-pencil"></i></button>' +
                '<button class="btn btn-light btn-sm text-danger" data-action="delete" data-id="' + id + '" title="Eliminar" aria-label="Eliminar"><i class="bi bi-trash"></i></button></div></td></tr>';
        }).join('');
    }

    async function loadDevices() {
        var body = document.getElementById('devicesTable');
        body.innerHTML = '<tr><td colspan="6"><div class="loading-state"><span class="spinner-border spinner-border-sm me-2"></span>Cargando dispositivos…</div></td></tr>';
        try {
            var result = App.unwrap(await App.apiRequest('/api/dispositivos'));
            devices = Array.isArray(result) ? result : [];
            showRows();
        } catch (error) {
            body.innerHTML = '<tr><td colspan="6"><div class="empty-state">No se pudieron cargar los dispositivos.</div></td></tr>';
            App.showAlert('Error al consultar dispositivos: ' + error.message, 'warning');
        }
    }

    function resetForm() {
        document.querySelectorAll('#dis_tipo option[data-dynamic], #dis_stat option[data-dynamic]').forEach(function (option) {
            option.remove();
        });
        document.getElementById('deviceForm').reset();
        document.getElementById('deviceBackendId').value = '';
        document.getElementById('dis_id').readOnly = false;
        document.getElementById('deviceModalTitle').textContent = 'Nuevo dispositivo';
        document.getElementById('saveDeviceButton').innerHTML = '<i class="bi bi-check2 me-1"></i>Guardar dispositivo';
    }

    function openCreate() {
        resetForm();
        deviceModal.show();
    }

    function openEdit(device) {
        resetForm();
        document.getElementById('deviceBackendId').value = device.id;
        document.getElementById('dis_id').value = String(device.id).padStart(5, '0').slice(-5);
        document.getElementById('dis_id').readOnly = true;
        document.getElementById('dis_nombre').value = device.nombre || '';
        var typeSelect = document.getElementById('dis_tipo');
        if (!Object.prototype.hasOwnProperty.call(types, device.tipo)) {
            var typeOption = new Option('Tipo actual: ' + (device.tipo || 'Otro'), device.tipo || 'Otro');
            typeOption.dataset.dynamic = 'true';
            typeSelect.add(typeOption);
        }
        typeSelect.value = device.tipo || 'RT';
        document.getElementById('dis_ip').value = device.ip || '';
        document.getElementById('dis_mac').value = device.mac || '';
        document.getElementById('dis_obs').value = device.ubicacion || '';
        var statusSelect = document.getElementById('dis_stat');
        if (['1', '0', 'M'].indexOf(String(device.estado)) === -1 && device.estado) {
            var statusOption = new Option('Estado actual: ' + device.estado, device.estado);
            statusOption.dataset.dynamic = 'true';
            statusSelect.add(statusOption);
        }
        statusSelect.value = device.estado || '1';
        document.getElementById('deviceModalTitle').textContent = 'Editar dispositivo';
        document.getElementById('saveDeviceButton').innerHTML = '<i class="bi bi-check2 me-1"></i>Guardar cambios';
        deviceModal.show();
    }

    function validIp(ip) {
        var parts = ip.split('.');
        if (parts.length === 4 && parts.every(function (part) { return /^\d{1,3}$/.test(part) && Number(part) <= 255; })) return true;
        if (ip.indexOf(':') !== -1) {
            try { return new URL('http://[' + ip + ']/').hostname.length > 2; } catch (error) { return false; }
        }
        return false;
    }

    async function saveDevice(event) {
        event.preventDefault();
        var form = event.currentTarget;
        if (!form.reportValidity()) return;
        var ip = document.getElementById('dis_ip').value.trim();
        if (!validIp(ip)) {
            document.getElementById('dis_ip').setCustomValidity('Introduce una dirección IPv4 o IPv6 válida.');
            form.reportValidity();
            document.getElementById('dis_ip').setCustomValidity('');
            return;
        }
        var mac = document.getElementById('dis_mac').value.trim();
        if (mac && !/^(?:[0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/i.test(mac)) {
            App.showAlert('La dirección MAC debe tener un formato válido (por ejemplo, 00:1A:2B:3C:4D:5E).', 'warning');
            return;
        }

        var backendId = document.getElementById('deviceBackendId').value;
        var payload = {
            nombre: document.getElementById('dis_nombre').value.trim(),
            ip: ip,
            mac: mac,
            tipo: document.getElementById('dis_tipo').value,
            ubicacion: document.getElementById('dis_obs').value.trim(),
            estado: document.getElementById('dis_stat').value,
            dis_id: document.getElementById('dis_id').value.trim(),
            sistema_operativo: document.getElementById('dis_sisop').value.trim()
        };
        var button = document.getElementById('saveDeviceButton');
        button.disabled = true;
        try {
            await App.apiRequest(backendId ? '/api/dispositivos/' + encodeURIComponent(backendId) : '/api/dispositivos', {
                method: backendId ? 'PUT' : 'POST',
                body: payload
            });
            deviceModal.hide();
            App.showAlert(backendId ? 'Dispositivo actualizado correctamente.' : 'Dispositivo registrado correctamente.', 'success');
            await loadDevices();
        } catch (error) {
            App.showAlert('No se pudo guardar el dispositivo: ' + error.message, 'danger');
        } finally {
            button.disabled = false;
        }
    }

    async function showIncidents(id, device) {
        document.getElementById('deviceIncidentsTitle').textContent = 'Incidencias · ' + (device.nombre || ('Dispositivo #' + id));
        var content = document.getElementById('deviceIncidentsContent');
        content.innerHTML = '<div class="loading-state"><span class="spinner-border spinner-border-sm me-2"></span>Cargando incidencias…</div>';
        incidentsModal.show();
        try {
            var rows = App.unwrap(await App.apiRequest('/api/dispositivos/' + encodeURIComponent(id) + '/incidencias'));
            if (!Array.isArray(rows) || !rows.length) {
                content.innerHTML = '<div class="empty-state">Este dispositivo no tiene incidencias registradas.</div>';
                return;
            }
            content.innerHTML = '<div class="table-responsive"><table class="table app-table"><thead><tr><th>ID</th><th>Título</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>' +
                rows.map(function (row) {
                    return '<tr><td>' + App.escapeHtml(row.id) + '</td><td>' + App.escapeHtml(row.titulo) + '</td><td>' + App.incidentStatusBadge(row.estado) + '</td><td>' + App.escapeHtml(App.formatDate(row.fecha_reporte)) + '</td></tr>';
                }).join('') + '</tbody></table></div>';
        } catch (error) {
            content.innerHTML = '<div class="alert alert-warning mb-0">No se pudieron consultar las incidencias: ' + App.escapeHtml(error.message) + '</div>';
        }
    }

    async function handleTableAction(event) {
        var button = event.target.closest('button[data-action]');
        if (!button) return;
        var device = devices.find(function (item) { return Number(item.id) === Number(button.dataset.id); });
        if (!device) return;
        if (button.dataset.action === 'edit') {
            openEdit(device);
        } else if (button.dataset.action === 'incidents') {
            await showIncidents(device.id, device);
        } else if (button.dataset.action === 'delete') {
            if (!window.confirm('¿Eliminar el dispositivo "' + (device.nombre || device.id) + '"?')) return;
            button.disabled = true;
            try {
                await App.apiRequest('/api/dispositivos/' + encodeURIComponent(device.id), { method: 'DELETE' });
                App.showAlert('Dispositivo eliminado correctamente.', 'success');
                await loadDevices();
            } catch (error) {
                App.showAlert('No se pudo eliminar el dispositivo: ' + error.message, 'danger');
                button.disabled = false;
            }
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        deviceModal = new bootstrap.Modal(document.getElementById('deviceModal'));
        incidentsModal = new bootstrap.Modal(document.getElementById('deviceIncidentsModal'));
        document.getElementById('createDeviceButton').addEventListener('click', openCreate);
        document.getElementById('reloadDevices').addEventListener('click', loadDevices);
        document.getElementById('deviceForm').addEventListener('submit', saveDevice);
        document.getElementById('devicesTable').addEventListener('click', handleTableAction);
        loadDevices();
    });
}());
