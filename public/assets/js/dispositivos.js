(function () {
    'use strict';

    var App = window.App;
    var devices = [];
    var previewMode = false;
    var currentDevice = null;
    var justCreatedId = null;
    var viewMode = 'grid';
    var formMode = 'create';
    var typeLabels = { RT: 'Router', SW: 'Switch', AP: 'Punto de acceso', FW: 'Firewall', SV: 'Servidor', PC: 'Host / PC' };
    var typeIcons = { RT: 'bi-router', SW: 'bi-hdd-network', AP: 'bi-wifi', FW: 'bi-shield-check', SV: 'bi-server', PC: 'bi-pc-display' };
    var sampleDevices = [
        { id: 1, codigo: 'DEV-001', nombre: 'Switch principal', ip: '192.168.1.10', tipo: 'SW', estado: 'en_linea', ubicacion: 'Cuarto de comunicaciones', responsable: 'Carlos Ruiz', funcion: 'Distribución de red LAN' },
        { id: 2, codigo: 'DEV-002', nombre: 'Router de acceso', ip: '192.168.1.1', tipo: 'RT', estado: 'en_linea', ubicacion: 'Sala de servidores', responsable: 'Laura Méndez', funcion: 'Enrutamiento de red' },
        { id: 3, codigo: 'DEV-003', nombre: 'Firewall perimetral', ip: '192.168.1.2', tipo: 'FW', estado: 'fuera_de_linea', ubicacion: 'Sala de servidores', responsable: 'Laura Méndez', funcion: 'Seguridad perimetral' },
        { id: 4, codigo: 'DEV-004', nombre: 'Punto de acceso — Recepción', ip: '192.168.1.20', tipo: 'AP', estado: 'en_linea', ubicacion: 'Recepción', responsable: 'Carlos Ruiz', funcion: 'Cobertura inalámbrica' },
        { id: 5, codigo: 'DEV-005', nombre: 'Switch de respaldo', ip: '192.168.1.11', tipo: 'SW', estado: 'desconocido', ubicacion: 'Almacén técnico', responsable: 'Ana Martínez', funcion: 'Redundancia LAN' },
        { id: 6, codigo: 'DEV-006', nombre: 'Router de laboratorio', ip: '192.168.1.3', tipo: 'RT', estado: 'en_linea', ubicacion: 'Laboratorio', responsable: 'Ana Martínez', funcion: 'Red de pruebas' }
    ];

    function deviceCode(device) {
        if (device.codigo || device.dis_id) return String(device.codigo || device.dis_id);
        return 'DEV-' + String(device.id).padStart(3, '0');
    }

    function statusInfo(state) {
        var value = String(state || '').toLowerCase();
        if (['en_linea', 'activo', '1'].indexOf(value) !== -1) return { label: 'Activo', className: 'state-active', formValue: 'activo' };
        if (['fuera_de_linea', 'advertencia', 'falla', 'm'].indexOf(value) !== -1) return { label: 'En falla', className: 'state-failure', formValue: 'falla' };
        return { label: 'Inactivo', className: 'state-inactive', formValue: 'inactivo' };
    }

    function escape(value) {
        return App.escapeHtml(value == null || value === '' ? '—' : value);
    }

    function notify(message, type) {
        App.showAlert(message, type || 'info');
    }

    function showView(name) {
        document.querySelectorAll('.flow-view').forEach(function (view) {
            view.classList.toggle('d-none', view.id !== name);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showInventoryAlert(message, type) {
        var notice = document.getElementById('devicePreviewNotice');
        notice.className = 'alert alert-soft-' + (type || 'warning');
        notice.textContent = message;
        notice.classList.remove('d-none');
    }

    function renderTypeFilter() {
        var select = document.getElementById('deviceTypeFilter');
        var current = select.value;
        var available = {};
        devices.forEach(function (device) {
            if (device.tipo) available[device.tipo] = typeLabels[device.tipo] || device.tipo;
        });
        select.innerHTML = '<option value="">Todos los tipos</option>' + Object.keys(available).sort().map(function (type) {
            return '<option value="' + App.escapeHtml(type) + '">' + App.escapeHtml(available[type]) + '</option>';
        }).join('');
        if (available[current]) select.value = current;
    }

    function visibleDevices() {
        var query = document.getElementById('deviceSearch').value.trim().toLowerCase();
        var type = document.getElementById('deviceTypeFilter').value;
        return devices.filter(function (device) {
            var searchable = [deviceCode(device), device.nombre, device.ip, device.ubicacion].join(' ').toLowerCase();
            return (!query || searchable.indexOf(query) !== -1) && (!type || device.tipo === type);
        });
    }

    function renderDeviceCard(device) {
        var status = statusInfo(device.estado);
        var code = deviceCode(device);
        var icon = typeIcons[device.tipo] || 'bi-hdd-network';
        var isNew = String(device.id) === String(justCreatedId);
        return '<article class="device-card' + (isNew ? ' newly-added' : '') + '">' +
            '<div class="device-card-top"><span class="device-type-icon"><i class="bi ' + icon + '" aria-hidden="true"></i></span><span class="state-pill ' + status.className + '">' + status.label + '</span></div>' +
            '<div class="device-identity"><span class="device-code">' + escape(code) + '</span>' + (isNew ? '<span class="new-tag">NUEVO</span>' : '') +
            '<h3 title="' + escape(device.nombre) + '">' + escape(device.nombre || 'Sin nombre') + '</h3><span class="ip-address">' + escape(device.ip) + '</span></div>' +
            '<div class="device-meta"><span><i class="bi bi-geo-alt" aria-hidden="true"></i>' + escape(device.ubicacion || 'Ubicación no registrada') + '</span><span><i class="bi bi-person" aria-hidden="true"></i>' + escape(device.responsable || 'Responsable no asignado') + '</span></div>' +
            '<div class="device-card-bottom"><span>' + escape(typeLabels[device.tipo] || device.tipo || 'Dispositivo') + '</span><button class="text-link" type="button" data-device-action="details" data-device-id="' + escape(device.id) + '">Ver dispositivo ↗</button></div>' +
            '</article>';
    }

    function renderDeviceRow(device) {
        var status = statusInfo(device.estado);
        return '<tr><td><span class="device-code">' + escape(deviceCode(device)) + '</span></td><td><span class="device-name">' + escape(device.nombre || 'Sin nombre') + '</span><span class="secondary-line">' + escape(typeLabels[device.tipo] || device.tipo) + '</span></td>' +
            '<td class="ip-address">' + escape(device.ip) + '</td><td>' + escape(device.ubicacion || '—') + '</td><td><span class="state-pill ' + status.className + '">' + status.label + '</span></td>' +
            '<td><div class="d-flex gap-2"><button class="text-link" type="button" data-device-action="details" data-device-id="' + escape(device.id) + '">Ver dispositivo ↗</button><button class="text-link" type="button" data-device-action="edit" data-device-id="' + escape(device.id) + '" aria-label="Editar dispositivo"><i class="bi bi-pencil"></i></button></div></td></tr>';
    }

    function renderDevices() {
        var visible = visibleDevices();
        var totalText = visible.length + (visible.length === 1 ? ' dispositivo mostrado' : ' dispositivos mostrados');
        document.getElementById('deviceCount').textContent = devices.length + (devices.length === 1 ? ' dispositivo registrado' : ' dispositivos registrados');
        document.getElementById('deviceGrid').innerHTML = visible.length
            ? visible.map(renderDeviceCard).join('')
            : '<div class="empty-state">No se encontraron dispositivos con esos criterios.</div>';
        document.getElementById('deviceListBody').innerHTML = visible.length
            ? visible.map(renderDeviceRow).join('')
            : '<tr><td colspan="6"><div class="empty-state">No se encontraron dispositivos con esos criterios.</div></td></tr>';
        document.getElementById('deviceList').setAttribute('aria-label', totalText);
        document.getElementById('deviceGrid').classList.toggle('d-none', viewMode !== 'grid');
        document.getElementById('deviceList').classList.toggle('d-none', viewMode !== 'list');
    }

    async function loadDevices() {
        try {
            var result = App.unwrap(await App.apiRequest('/api/dispositivos'));
            if (!Array.isArray(result)) throw new Error('El endpoint no devolvió una lista de dispositivos.');
            devices = result;
            previewMode = false;
            document.getElementById('devicePreviewNotice').classList.add('d-none');
        } catch (error) {
            previewMode = true;
            if (!devices.length) devices = sampleDevices.map(function (device) { return Object.assign({}, device, { _preview: true }); });
            showInventoryAlert('Vista previa con datos de ejemplo: no se pudo conectar con el inventario real. Las acciones de demostración no se guardan en la base de datos.', 'warning');
        }
        renderTypeFilter();
        renderDevices();
    }

    function setViewMode(mode) {
        viewMode = mode;
        document.getElementById('gridViewButton').classList.toggle('active', mode === 'grid');
        document.getElementById('listViewButton').classList.toggle('active', mode === 'list');
        document.getElementById('gridViewButton').setAttribute('aria-pressed', mode === 'grid' ? 'true' : 'false');
        document.getElementById('listViewButton').setAttribute('aria-pressed', mode === 'list' ? 'true' : 'false');
        renderDevices();
    }

    function resetForm() {
        var form = document.getElementById('deviceForm');
        form.reset();
        document.getElementById('deviceBackendId').value = '';
        document.getElementById('deviceCode').readOnly = false;
        document.getElementById('deviceCodeLock').classList.add('d-none');
        document.getElementById('deviceCodeHint').textContent = 'Identificador para consultar al equipo. El backend actual genera el ID numérico.';
        document.getElementById('deviceFormAlert').className = 'd-none';
        document.getElementById('ipConflictCard').classList.remove('visible');
        document.getElementById('deviceFormStatus').textContent = 'Completa todos los campos para continuar.';
        clearValidation();
        document.querySelectorAll('#deviceType option[data-dynamic], #deviceResponsible option[data-dynamic]').forEach(function (option) { option.remove(); });
    }

    function setFormMode(mode, device) {
        resetForm();
        formMode = mode;
        currentDevice = device || null;
        var editing = mode === 'edit' && device;
        document.querySelector('#deviceFormBack span').textContent = editing
            ? 'Volver al detalle de ' + deviceCode(device)
            : 'Volver a dispositivos';
        document.getElementById('deviceFormTitle').textContent = editing ? 'Editar dispositivo' : 'Registrar dispositivo';
        document.getElementById('deviceFormSubtitle').textContent = editing
            ? (device.nombre || 'Dispositivo') + ' · Revisa la información y guarda los cambios.'
            : 'Completa los datos para incorporar el equipo al inventario.';
        document.getElementById('formChecklistTitle').textContent = editing ? 'Antes de guardar' : 'Antes de registrar';
        document.getElementById('formAsideTitle').textContent = editing ? 'Decisión de diseño' : 'Un registro, varias vistas';
        document.getElementById('formAsideText').textContent = editing
            ? 'El código se muestra no editable para conservar la trazabilidad. El backend genera un ID numérico y no persiste responsable ni función.'
            : 'Después del registro, el equipo estará disponible en monitoreo e incidencias. El backend genera el ID y no persiste responsable ni función.';
        document.getElementById('saveDeviceButton').innerHTML = editing
            ? '<i class="bi bi-check2"></i>Guardar cambios'
            : '<i class="bi bi-plus-lg"></i>Registrar dispositivo';
        if (editing) {
            document.getElementById('deviceBackendId').value = device.id;
            var code = document.getElementById('deviceCode');
            code.value = deviceCode(device);
            code.readOnly = true;
            document.getElementById('deviceCodeLock').classList.remove('d-none');
            document.getElementById('deviceCodeHint').textContent = 'Identificador conservado durante la edición.';
            document.getElementById('deviceName').value = device.nombre || '';
            selectExistingValue('deviceType', device.tipo, typeLabels[device.tipo] || device.tipo);
            document.getElementById('deviceIp').value = device.ip || '';
            document.getElementById('deviceLocation').value = device.ubicacion || '';
            selectExistingValue('deviceResponsible', device.responsable, device.responsable);
            document.getElementById('deviceFunction').value = device.funcion || '';
            document.getElementById('deviceStatus').value = statusInfo(device.estado).formValue;
        }
        showView('deviceFormView');
    }

    function selectExistingValue(id, value, label) {
        var select = document.getElementById(id);
        if (!value) return;
        if (!Array.prototype.some.call(select.options, function (option) { return option.value === String(value); })) {
            var option = new Option(label || value, value);
            option.dataset.dynamic = 'true';
            select.add(option);
        }
        select.value = value;
    }

    function clearValidation() {
        document.querySelectorAll('#deviceForm .is-invalid').forEach(function (field) { field.classList.remove('is-invalid'); });
        document.querySelectorAll('#deviceForm .field-error').forEach(function (error) { error.classList.remove('visible'); });
        document.getElementById('deviceIpIcon').classList.add('d-none');
    }

    function ipv4IsValid(value) {
        var octets = value.trim().split('.');
        if (octets.length !== 4) return false;
        return octets.every(function (octet) {
            return /^(0|[1-9]\d{0,2})$/.test(octet) && Number(octet) >= 0 && Number(octet) <= 255;
        });
    }

    function duplicateIp(ip, currentId) {
        var normalized = ip.trim();
        return devices.find(function (device) {
            return String(device.id) !== String(currentId || '') && String(device.ip || '').trim().toLowerCase() === normalized.toLowerCase();
        });
    }

    function showConflict(device) {
        document.getElementById('ipConflictCard').classList.add('visible');
        document.getElementById('conflictCode').textContent = deviceCode(device);
        document.getElementById('conflictName').textContent = device.nombre || 'Dispositivo';
        document.getElementById('conflictIp').textContent = device.ip || '';
        document.getElementById('deviceIp').classList.add('is-invalid');
        document.getElementById('deviceIpIcon').classList.remove('d-none');
        document.querySelector('[data-error-for="deviceIp"]').textContent = 'Esta dirección IP ya está asignada a otro equipo.';
        document.querySelector('[data-error-for="deviceIp"]').classList.add('visible');
    }

    function showFormError(title, detail, type) {
        var host = document.getElementById('deviceFormAlert');
        host.className = 'alert alert-soft-' + (type || 'danger');
        host.innerHTML = '<h2 class="alert-heading"><i class="bi bi-exclamation-circle me-1"></i>' + App.escapeHtml(title) + '</h2><p class="alert-detail">' + App.escapeHtml(detail) + '</p>';
    }

    function validateForm() {
        clearValidation();
        document.getElementById('ipConflictCard').classList.remove('visible');
        var requiredFields = ['deviceCode', 'deviceName', 'deviceIp', 'deviceType', 'deviceLocation', 'deviceResponsible', 'deviceFunction', 'deviceStatus'];
        var invalid = [];
        requiredFields.forEach(function (id) {
            var field = document.getElementById(id);
            var isInvalid = !field.value.trim();
            if (id === 'deviceCode' && field.value.trim() && !/^DEV-\d{3}$/i.test(field.value.trim())) isInvalid = true;
            if (id === 'deviceIp' && field.value.trim() && !ipv4IsValid(field.value)) isInvalid = true;
            if (isInvalid) {
                field.classList.add('is-invalid');
                var error = document.querySelector('[data-error-for="' + id + '"]');
                if (error) {
                    if (id === 'deviceCode' && field.value.trim()) error.textContent = 'Usa el formato DEV-001.';
                    if (id === 'deviceIp' && field.value.trim()) error.textContent = 'IPv4 no válida. Usa valores entre 0 y 255.';
                    error.classList.add('visible');
                }
                invalid.push(field);
            }
        });

        var conflict = document.getElementById('deviceIp').value.trim()
            ? duplicateIp(document.getElementById('deviceIp').value, document.getElementById('deviceBackendId').value)
            : null;
        if (conflict) {
            showConflict(conflict);
            invalid.push(document.getElementById('deviceIp'));
            showFormError('Esta dirección IP ya está en uso', conflict.ip + ' pertenece a ' + deviceCode(conflict) + ' · ' + (conflict.nombre || 'otro dispositivo') + '. El dispositivo no se registró.', 'danger');
        }

        if (invalid.length && !conflict) {
            var count = invalid.length;
            showFormError('Revisa los ' + count + ' campos señalados', 'Completa los campos obligatorios y corrige el formato de la dirección IPv4.', 'danger');
        }
        document.getElementById('deviceFormStatus').textContent = invalid.length ? 'Corrige los campos para continuar.' : 'Todos los campos están completos.';
        return invalid.length === 0;
    }

    function formPayload() {
        var selectedState = document.getElementById('deviceStatus').value;
        return {
            nombre: document.getElementById('deviceName').value.trim(),
            ip: document.getElementById('deviceIp').value.trim(),
            tipo: document.getElementById('deviceType').value,
            ubicacion: document.getElementById('deviceLocation').value.trim(),
            estado: { activo: 'en_linea', inactivo: 'desconocido', falla: 'fuera_de_linea' }[selectedState],
            codigo: document.getElementById('deviceCode').value.trim(),
            responsable: document.getElementById('deviceResponsible').value,
            funcion: document.getElementById('deviceFunction').value.trim()
        };
    }

    function localPreviewSave(payload, editingId) {
        if (editingId) {
            var existing = devices.find(function (device) { return String(device.id) === String(editingId); });
            if (existing) Object.assign(existing, payload);
            currentDevice = existing || currentDevice;
        } else {
            var nextId = devices.reduce(function (max, device) { return Math.max(max, Number(device.id) || 0); }, 0) + 1;
            var newDevice = Object.assign({ id: nextId, _preview: true }, payload);
            devices.unshift(newDevice);
            justCreatedId = String(nextId);
            currentDevice = newDevice;
        }
        renderTypeFilter();
        renderDevices();
        document.getElementById('deviceForm').reset();
        showInventoryAlert('Vista previa: el cambio se muestra solo durante esta sesión y no se guardó en la base de datos.', 'warning');
        showView('devicesInventoryView');
    }

    async function saveDevice(event) {
        event.preventDefault();
        if (!validateForm()) return;
        var backendId = document.getElementById('deviceBackendId').value;
        var payload = formPayload();
        if (previewMode || (currentDevice && currentDevice._preview)) {
            localPreviewSave(payload, backendId);
            return;
        }
        var button = document.getElementById('saveDeviceButton');
        button.disabled = true;
        try {
            var response = await App.apiRequest(backendId ? '/api/dispositivos/' + encodeURIComponent(backendId) : '/api/dispositivos', {
                method: backendId ? 'PUT' : 'POST',
                body: payload
            });
            var data = App.unwrap(response) || {};
            var savedDevice = data.dispositivo || currentDevice || {};
            if (savedDevice.id != null) justCreatedId = String(savedDevice.id);
            currentDevice = savedDevice;
            await loadDevices();
            if (backendId) {
                openDetails(currentDevice, 'Cambios guardados correctamente.');
            } else {
                showView('devicesInventoryView');
                var code = deviceCode(savedDevice);
                var name = savedDevice.nombre || payload.nombre;
                var ip = savedDevice.ip || payload.ip;
                var banner = document.getElementById('deviceSuccessBanner');
                banner.innerHTML = '<div class="d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill mt-1"></i><div><h2 class="alert-heading">Dispositivo registrado correctamente</h2><p class="alert-detail">' + App.escapeHtml(code + ' · ' + name + ' · ' + ip) + ' ya está en el inventario y disponible para monitoreo, incidencias y mantenimientos.</p><a class="text-link" href="/monitoreo?codigo=' + encodeURIComponent(code) + '">Ver ' + App.escapeHtml(code) + ' en monitoreo →</a></div></div>';
                banner.classList.remove('d-none');
            }
        } catch (error) {
            var message = error.message || 'No se pudo guardar el dispositivo.';
            var conflict = /ip|dirección|direccion/i.test(message) && /uso|asignad|duplicad/i.test(message);
            if (conflict) {
                var found = duplicateIp(payload.ip, backendId);
                if (found) showConflict(found);
                showFormError('Esta dirección IP ya está en uso', message, 'danger');
            } else {
                showFormError('No se guardaron los cambios', message, 'danger');
                notify('No se pudo guardar el dispositivo: ' + message, 'warning');
            }
        } finally {
            button.disabled = false;
        }
    }

    function openDetails(device, successMessage) {
        currentDevice = device;
        var code = deviceCode(device);
        var status = statusInfo(device.estado);
        document.getElementById('detailDeviceName').textContent = device.nombre || 'Dispositivo';
        document.getElementById('detailDeviceSubtitle').textContent = code + ' · Ficha del dispositivo';
        document.getElementById('deviceDetailSuccess').classList.toggle('d-none', !successMessage);
        document.getElementById('deviceDetailSuccess').innerHTML = successMessage
            ? '<i class="bi bi-check-circle me-1"></i><strong>Cambios guardados correctamente</strong><p class="alert-detail mb-0">' + App.escapeHtml('La información de ' + code + ' se actualizó en el inventario.') + '</p>'
            : '';
        var fields = [
            ['Código', code], ['Nombre / identificador', device.nombre], ['Dirección IPv4', device.ip],
            ['Tipo de dispositivo', typeLabels[device.tipo] || device.tipo], ['Ubicación', device.ubicacion],
            ['Responsable', device.responsable], ['Función', device.funcion]
        ];
        document.getElementById('deviceDetailFields').innerHTML = fields.map(function (field) {
            return '<div class="detail-item"><dt>' + App.escapeHtml(field[0]) + '</dt><dd class="' + (field[0] === 'Código' || field[0] === 'Dirección IPv4' ? 'mono' : '') + '">' + escape(field[1]) + '</dd></div>';
        }).join('');
        document.getElementById('detailDeviceStatus').innerHTML = '<span class="state-pill ' + status.className + '">' + status.label + '</span>';
        document.getElementById('detailDeviceIp').textContent = device.ip || '—';
        var monitorUrl = '/monitoreo?codigo=' + encodeURIComponent(code);
        document.getElementById('monitorDeviceLink').href = monitorUrl;
        document.getElementById('detailMonitorAction').href = monitorUrl;
        document.getElementById('detailMonitorState').textContent = 'Estado operativo: ' + status.label;
        document.getElementById('detailIncidentsAction').href = '/incidencias?dispositivo=' + encodeURIComponent(device.id);
        document.getElementById('deviceLastMovement').textContent = device.ultimo_monitoreo
            ? 'Última comprobación de ' + code + ': ' + App.formatDate(device.ultimo_monitoreo) + '.'
            : 'Alta de ' + code + ' · ' + (device.nombre || 'Dispositivo') + ' incorporado al inventario con la IP ' + (device.ip || 'no registrada') + '.';
        document.getElementById('detailIncidentCount').textContent = 'Consulta las incidencias asociadas.';
        showView('deviceDetailView');
        if (!device._preview && device.id != null) {
            App.apiRequest('/api/dispositivos/' + encodeURIComponent(device.id) + '/incidencias').then(function (response) {
                var rows = App.unwrap(response);
                document.getElementById('detailIncidentCount').textContent = Array.isArray(rows)
                    ? (rows.length ? rows.length + (rows.length === 1 ? ' incidencia asociada' : ' incidencias asociadas') : 'Sin incidencias asociadas')
                    : 'Consulta las incidencias asociadas.';
            }).catch(function () {
                document.getElementById('detailIncidentCount').textContent = 'Incidencias no disponibles.';
            });
        } else if (device._preview) {
            document.getElementById('detailIncidentCount').textContent = 'Datos de ejemplo';
        }
    }

    function currentIsPreview() {
        return Boolean(currentDevice && currentDevice._preview);
    }

    async function handleDelete() {
        if (!currentDevice || !window.confirm('¿Eliminar ' + deviceCode(currentDevice) + ' · ' + currentDevice.nombre + '?')) return;
        if (currentIsPreview()) {
            devices = devices.filter(function (device) { return String(device.id) !== String(currentDevice.id); });
            currentDevice = null;
            renderTypeFilter();
            renderDevices();
            showInventoryAlert('Vista previa: el dispositivo se quitó de la lista de demostración, sin modificar la base de datos.', 'warning');
            showView('devicesInventoryView');
            return;
        }
        try {
            await App.apiRequest('/api/dispositivos/' + encodeURIComponent(currentDevice.id), { method: 'DELETE' });
            currentDevice = null;
            await loadDevices();
            showInventoryAlert('Dispositivo eliminado correctamente.', 'success');
            showView('devicesInventoryView');
        } catch (error) {
            notify('No se pudo eliminar el dispositivo: ' + error.message, 'danger');
        }
    }

    async function showHistory() {
        if (!currentDevice) return;
        if (currentDevice._preview) {
            notify('Historial de ejemplo: la API no está disponible en este momento.', 'warning');
            return;
        }
        try {
            var result = App.unwrap(await App.apiRequest('/api/monitoreo/dispositivo/' + encodeURIComponent(currentDevice.id)));
            var rows = Array.isArray(result) ? result : [];
            var historyText = rows.length
                ? rows.slice(0, 3).map(function (row) { return (row.estado || 'Comprobación') + ' · ' + App.formatDate(row.fecha_monitoreo) + (row.latencia_ms == null ? '' : ' · ' + row.latencia_ms + ' ms'); }).join(' | ')
                : 'No hay registros de monitoreo.';
            document.getElementById('deviceLastMovement').textContent = historyText;
        } catch (error) {
            notify('No se pudo cargar el historial: ' + error.message, 'warning');
        }
    }

    function handleAction(event) {
        var button = event.target.closest('[data-device-action]');
        if (!button) return;
        var action = button.dataset.deviceAction;
        if (action === 'back-inventory' || action === 'cancel-form') {
            if (formMode === 'edit' && currentDevice) openDetails(currentDevice);
            else showView('devicesInventoryView');
            return;
        }
        if (action === 'delete-current') {
            handleDelete();
            return;
        }
        if (action === 'edit-current') {
            if (currentDevice) setFormMode('edit', currentDevice);
            return;
        }
        if (action === 'show-history') {
            showHistory();
            return;
        }
        var device = devices.find(function (item) { return String(item.id) === String(button.dataset.deviceId); });
        if (!device) return;
        if (action === 'details') openDetails(device);
        if (action === 'edit') setFormMode('edit', device);
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('createDeviceButton').addEventListener('click', function () {
            setFormMode('create');
        });
        document.getElementById('deviceForm').addEventListener('submit', saveDevice);
        document.getElementById('deviceSearch').addEventListener('input', renderDevices);
        document.getElementById('deviceTypeFilter').addEventListener('change', renderDevices);
        document.getElementById('gridViewButton').addEventListener('click', function () { setViewMode('grid'); });
        document.getElementById('listViewButton').addEventListener('click', function () { setViewMode('list'); });
        document.getElementById('deviceIp').addEventListener('input', function () {
            this.classList.remove('is-invalid');
            document.getElementById('ipConflictCard').classList.remove('visible');
            document.querySelector('[data-error-for="deviceIp"]').classList.remove('visible');
            var existing = this.value.trim() && ipv4IsValid(this.value) ? duplicateIp(this.value, document.getElementById('deviceBackendId').value) : null;
            if (existing) showConflict(existing);
        });
        document.addEventListener('click', handleAction);
        loadDevices();

        var requestedCode = new URLSearchParams(window.location.search).get('codigo');
        if (requestedCode) document.getElementById('deviceSearch').value = requestedCode;
    });
}());
