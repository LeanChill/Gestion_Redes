<?php
<<<<<<< HEAD
$titulo = $titulo ?? 'Dispositivos · Optisys';
$pageScript = '/assets/js/dispositivos.js';
require __DIR__ . '/layout/header.php';
?>
<section id="devicesInventoryView" class="flow-view">
    <header class="page-heading">
        <div>
            <h1>Dispositivos</h1>
            <p>Tu infraestructura de red, organizada en un solo lugar.</p>
        </div>
        <button class="btn btn-primary btn-icon" type="button" id="createDeviceButton"><i class="bi bi-plus-lg"></i>Registrar dispositivo</button>
    </header>

    <div id="deviceSuccessBanner" class="alert alert-soft-success d-none" role="status" aria-live="polite"></div>
    <div id="devicePreviewNotice" class="alert alert-soft-warning d-none" role="status"></div>

    <section class="device-toolbar-card" aria-label="Buscar y filtrar dispositivos">
        <div class="row g-2 align-items-end">
            <div class="col-12 col-md-6 col-xl-5">
                <label class="device-toolbar-label" for="deviceSearch">Buscar en el inventario</label>
                <div class="search-control"><i class="bi bi-search" aria-hidden="true"></i><input id="deviceSearch" class="form-control" type="search" placeholder="Código, nombre o dirección IP" autocomplete="off"></div>
            </div>
            <div class="col-8 col-md-4 col-xl-3">
                <label class="device-toolbar-label" for="deviceTypeFilter">Tipo de dispositivo</label>
                <select id="deviceTypeFilter" class="form-select"><option value="">Todos los tipos</option></select>
            </div>
            <div class="col-4 col-md-2 col-xl-4 d-flex justify-content-end">
                <div class="view-toggle" role="group" aria-label="Tipo de vista">
                    <button class="active" type="button" id="gridViewButton" aria-label="Vista cuadrícula" aria-pressed="true"><i class="bi bi-grid-3x3-gap-fill"></i></button>
                    <button type="button" id="listViewButton" aria-label="Vista lista" aria-pressed="false"><i class="bi bi-list-ul"></i></button>
                </div>
            </div>
        </div>
    </section>

    <div class="inventory-summary">
        <strong id="deviceCount">Cargando dispositivos…</strong>
        <div class="status-legend"><span class="legend-label">Estados:</span><span class="state-pill state-active">Activo</span><span class="state-pill state-inactive">Inactivo</span><span class="state-pill state-failure">En falla</span></div>
    </div>

    <div id="deviceGrid" class="device-grid" aria-live="polite">
        <div class="loading-state"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Cargando inventario…</div>
    </div>
    <div id="deviceList" class="device-list-wrap d-none">
        <div class="table-responsive">
            <table class="table app-table">
                <thead><tr><th>CÓDIGO</th><th>NOMBRE</th><th>DIRECCIÓN IP</th><th>UBICACIÓN</th><th>ESTADO</th><th>ACCIONES</th></tr></thead>
                <tbody id="deviceListBody"></tbody>
            </table>
        </div>
    </div>
</section>

<section id="deviceFormView" class="flow-view d-none">
    <button class="page-back" id="deviceFormBack" type="button" data-device-action="back-inventory"><i class="bi bi-arrow-left"></i><span>Volver a dispositivos</span></button>
    <header class="page-heading">
        <div><h1 id="deviceFormTitle">Registrar dispositivo</h1><p id="deviceFormSubtitle">Completa los datos para incorporar el equipo al inventario.</p></div>
    </header>
    <div id="deviceFormAlert" class="d-none" role="alert" aria-live="polite"></div>

    <form id="deviceForm" novalidate>
        <input type="hidden" id="deviceBackendId">
        <div class="flow-form-layout">
            <div class="flow-form-main">
                <section class="form-section">
                    <h2>Identificación y red</h2>
                    <p>Los campos con * son obligatorios.</p>
                    <div class="section-fields">
                        <div class="field">
                            <label class="form-label" for="deviceCode">Código *</label>
                            <div class="input-icon-wrap"><input id="deviceCode" class="form-control code-input" maxlength="10" placeholder="DEV-011" required><i class="bi bi-lock d-none" id="deviceCodeLock" aria-hidden="true"></i></div>
                            <small class="form-hint" id="deviceCodeHint">Identificador para consultar al equipo. El backend actual genera el ID numérico.</small>
                            <small class="field-error" data-error-for="deviceCode">Ingresa un código de dispositivo.</small>
                        </div>
                        <div class="field">
                            <label class="form-label" for="deviceName">Nombre / identificador *</label>
                            <input id="deviceName" class="form-control" maxlength="100" placeholder="Ej. Punto de acceso — Sala 3" required>
                            <small class="field-error" data-error-for="deviceName">Ingresa el nombre del dispositivo.</small>
                        </div>
                        <div class="field">
                            <label class="form-label" for="deviceIp">Dirección IPv4 *</label>
                            <div class="input-icon-wrap"><input id="deviceIp" class="form-control mono" maxlength="15" placeholder="192.168.1.21" inputmode="decimal" autocomplete="off" required><i class="bi bi-exclamation-circle d-none" id="deviceIpIcon" aria-hidden="true"></i></div>
                            <small class="form-hint" id="deviceIpHint">Cuatro números de 0 a 255, separados por puntos.</small>
                            <small class="field-error" data-error-for="deviceIp">Ingresa una dirección IPv4 válida.</small>
                        </div>
                        <div class="field">
                            <label class="form-label" for="deviceType">Tipo de dispositivo *</label>
                            <select id="deviceType" class="form-select" required>
                                <option value="AP">Punto de acceso</option><option value="RT">Router</option><option value="SW">Switch</option><option value="FW">Firewall</option><option value="SV">Servidor</option><option value="PC">Host / PC</option>
                            </select>
                            <small class="field-error" data-error-for="deviceType">Selecciona un tipo de dispositivo.</small>
                        </div>
                    </div>
                </section>
                <section class="form-section">
                    <h2>Contexto y asignación</h2>
                    <p>Ubica el dispositivo y define quién lo gestiona.</p>
                    <div class="section-fields">
                        <div class="field">
                            <label class="form-label" for="deviceLocation">Ubicación *</label>
                            <input id="deviceLocation" class="form-control" maxlength="250" placeholder="Ej. Sala 3" required>
                            <small class="field-error" data-error-for="deviceLocation">Indica la ubicación del equipo.</small>
                        </div>
                        <div class="field">
                            <label class="form-label" for="deviceResponsible">Responsable *</label>
                            <select id="deviceResponsible" class="form-select" required>
                                <option value="">Selecciona un responsable</option><option value="Carlos Ruiz">Carlos Ruiz</option><option value="Laura Méndez">Laura Méndez</option><option value="Ana Martínez">Ana Martínez</option><option value="Equipo de redes">Equipo de redes</option>
                            </select>
                            <small class="field-error" data-error-for="deviceResponsible">Selecciona un responsable.</small>
                        </div>
                        <div class="field">
                            <label class="form-label" for="deviceFunction">Función / Observaciones *</label>
                            <input id="deviceFunction" class="form-control" maxlength="250" placeholder="Ej. Distribución de red LAN" required>
                            <small class="field-error" data-error-for="deviceFunction">Indica la función o las observaciones.</small>
                        </div>
                        <div class="field">
                            <label class="form-label" for="deviceStatus">Estado operativo *</label>
                            <select id="deviceStatus" class="form-select" required><option value="activo">Activo</option><option value="inactivo">Inactivo</option><option value="falla">En falla</option></select>
                            <small class="form-hint">Activo, inactivo o en falla.</small>
                        </div>
                    </div>
                </section>
                <div class="form-footer">
                    <span class="form-footer-note" id="deviceFormStatus">Completa todos los campos para continuar.</span>
                    <div class="form-footer-actions">
                        <button class="btn btn-light" type="button" data-device-action="cancel-form">Cancelar</button>
                        <button class="btn btn-primary btn-icon" type="submit" id="saveDeviceButton"><i class="bi bi-plus-lg"></i>Registrar dispositivo</button>
                    </div>
                </div>
            </div>
            <aside class="flow-form-aside">
                <section class="help-card">
                    <h2><i class="bi bi-clipboard2-check me-1 text-primary"></i><span id="formChecklistTitle">Antes de registrar</span></h2>
                    <p>Cada equipo necesita un código y una IP únicos dentro del inventario.</p>
                    <ul class="check-list"><li><i class="bi bi-check2"></i>Completa todos los campos.</li><li><i class="bi bi-check2"></i>Usa una dirección IPv4 válida.</li><li><i class="bi bi-check2"></i>Verifica que la IP esté disponible.</li></ul>
                </section>
                <section class="help-card blue-help">
                    <h2><i class="bi bi-diagram-3 me-1"></i><span id="formAsideTitle">Un registro, varias vistas</span></h2>
                    <p id="formAsideText">Después del registro, el equipo estará disponible en monitoreo, incidencias y mantenimientos.</p>
                </section>
                <section id="ipConflictCard" class="ip-conflict-card" aria-live="polite">
                    <div class="conflict-label">IP OCUPADA</div>
                    <span class="conflict-code mono" id="conflictCode"></span>
                    <div class="conflict-card-title" id="conflictName"></div>
                    <div class="conflict-ip mono" id="conflictIp"></div>
                    <p class="form-hint mb-0 mt-2">No se permite compartir una IP entre dispositivos.</p>
                </section>
            </aside>
        </div>
    </form>
</section>

<section id="deviceDetailView" class="flow-view d-none">
    <button class="page-back" type="button" data-device-action="back-inventory"><i class="bi bi-arrow-left"></i>Volver a dispositivos</button>
    <header class="page-heading">
        <div><h1 id="detailDeviceName">Dispositivo</h1><p id="detailDeviceSubtitle" class="mono"></p></div>
        <div class="d-flex gap-2">
            <button class="btn btn-light btn-icon" type="button" data-device-action="delete-current"><i class="bi bi-trash3"></i><span class="d-none d-sm-inline">Eliminar</span></button>
            <button class="btn btn-primary btn-icon" type="button" data-device-action="edit-current"><i class="bi bi-pencil"></i>Editar dispositivo</button>
        </div>
    </header>
    <div id="deviceDetailSuccess" class="alert alert-soft-success d-none" role="status"></div>
    <section class="detail-overview">
        <article class="detail-card">
            <h2>Información del dispositivo</h2><p class="form-hint">Identificación, conectividad y asignación del equipo.</p>
            <dl class="detail-grid" id="deviceDetailFields"></dl>
        </article>
        <article class="detail-card detail-state-card">
            <h2><i class="bi bi-activity me-1 text-primary"></i>Estado operativo</h2>
            <div class="mt-2" id="detailDeviceStatus"></div>
            <p class="form-hint mb-0 mt-3">IP consultada</p><span id="detailDeviceIp" class="ip-address"></span>
            <a class="btn btn-light btn-icon" id="monitorDeviceLink" href="/monitoreo"><i class="bi bi-arrow-up-right"></i>Ver en monitoreo</a>
        </article>
    </section>
    <section class="mt-4">
        <h2 class="h6 fw-semibold mb-0">Gestión del dispositivo</h2>
        <div class="management-grid">
            <article class="management-card"><i class="bi bi-activity"></i><h3>Monitoreo</h3><p id="detailMonitorState">Estado operativo: —</p><a id="detailMonitorAction" class="text-link" href="/monitoreo">Consultar estado →</a></article>
            <article class="management-card"><i class="bi bi-exclamation-triangle"></i><h3>Incidencias</h3><p id="detailIncidentCount">Consulta las incidencias asociadas.</p><a id="detailIncidentsAction" class="text-link" href="/incidencias">Ver incidencias →</a></article>
            <article class="management-card"><i class="bi bi-wrench-adjustable"></i><h3>Mantenimientos</h3><p>Sin tareas programadas</p><span class="text-link text-secondary">Ver mantenimientos →</span></article>
            <article class="management-card"><i class="bi bi-clock-history"></i><h3>Historial</h3><p>Último movimiento del equipo</p><button class="text-link" type="button" data-device-action="show-history">Ver historial →</button></article>
        </div>
    </section>
    <article class="movement-card">
        <h3><i class="bi bi-clock-history"></i>Último movimiento</h3>
        <p id="deviceLastMovement">No hay movimientos recientes registrados.</p>
        <small>Los registros mostrados dependen de la información disponible en la API.</small>
    </article>
</section>
=======
$titulo = $titulo ?? 'Gestión de Dispositivos de Red';
$pageScript = '/assets/js/dispositivos.js';
require __DIR__ . '/layout/header.php';
?>
<section class="page-heading d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
    <div><p class="eyebrow mb-2">INVENTARIO</p><h1 class="h2 mb-1">Dispositivos</h1><p class="text-secondary mb-0">Registra equipos y administra sus datos de red.</p></div>
    <button class="btn btn-primary" id="createDeviceButton"><i class="bi bi-plus-lg me-2"></i>Nuevo dispositivo</button>
</section>
<div class="alert alert-info border-0 mt-4" role="note"><i class="bi bi-info-circle-fill me-2"></i>La API actual genera un ID numérico y persiste nombre, IP, MAC, tipo, ubicación y estado. El código de 5 caracteres y el sistema operativo no están soportados; el monitoreo usa además estados de conectividad distintos a Activo/Inactivo/Mantenimiento.</div>
<section class="content-card mt-3">
    <div class="section-title-row"><div><p class="eyebrow mb-1">EQUIPOS</p><h2 class="h5 mb-0">Listado de dispositivos</h2></div><button class="btn btn-sm btn-light" id="reloadDevices"><i class="bi bi-arrow-clockwise me-1"></i>Actualizar</button></div>
    <div class="table-responsive">
        <table class="table align-middle app-table mb-0">
            <thead><tr><th>Dispositivo</th><th>Tipo</th><th>IP / MAC</th><th>Estado</th><th>Último monitoreo</th><th class="text-end">Acciones</th></tr></thead>
            <tbody id="devicesTable"><tr><td colspan="6"><div class="loading-state"><span class="spinner-border spinner-border-sm me-2"></span>Cargando dispositivos…</div></td></tr></tbody>
        </table>
    </div>
</section>

<div class="modal fade" id="deviceModal" tabindex="-1" aria-labelledby="deviceModalTitle" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable"><div class="modal-content">
        <form id="deviceForm">
            <div class="modal-header"><div><p class="eyebrow mb-1">INVENTARIO</p><h2 class="modal-title fs-5" id="deviceModalTitle">Nuevo dispositivo</h2></div><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button></div>
            <div class="modal-body">
                <input type="hidden" id="deviceBackendId">
                <div class="row g-3">
                    <div class="col-md-4"><label class="form-label" for="dis_id">Código (dis_id)</label><input class="form-control" id="dis_id" maxlength="5" pattern=".{1,5}" required><div class="form-text">Requerido en el formulario; el backend asigna un ID numérico.</div></div>
                    <div class="col-md-8"><label class="form-label" for="dis_nombre">Nombre</label><input class="form-control" id="dis_nombre" maxlength="100" required></div>
                    <div class="col-md-6"><label class="form-label" for="dis_tipo">Tipo</label><select class="form-select" id="dis_tipo" required><option value="RT">Router</option><option value="SW">Switch</option><option value="SV">Servidor</option><option value="AP">Access Point</option><option value="PC">Host/PC</option></select></div>
                    <div class="col-md-6"><label class="form-label" for="dis_ip">Dirección IP</label><input class="form-control" id="dis_ip" maxlength="50" autocomplete="off" placeholder="192.168.1.1" required></div>
                    <div class="col-md-6"><label class="form-label" for="dis_mac">Dirección MAC</label><input class="form-control" id="dis_mac" maxlength="20" placeholder="00:1A:2B:3C:4D:5E"></div>
                    <div class="col-md-6"><label class="form-label" for="dis_stat">Estado</label><select class="form-select" id="dis_stat"><option value="1">Activo</option><option value="0">Inactivo</option><option value="M">Mantenimiento</option></select></div>
                    <div class="col-md-6"><label class="form-label" for="dis_sisop">Sistema operativo / firmware</label><input class="form-control" id="dis_sisop" maxlength="100"></div>
                    <div class="col-md-6"><label class="form-label" for="dis_obs">Observaciones / ubicación</label><input class="form-control" id="dis_obs" maxlength="250"></div>
                </div>
            </div>
            <div class="modal-footer"><button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button><button type="submit" class="btn btn-primary" id="saveDeviceButton"><i class="bi bi-check2 me-1"></i>Guardar dispositivo</button></div>
        </form>
    </div></div>
</div>
<div class="modal fade" id="deviceIncidentsModal" tabindex="-1" aria-labelledby="deviceIncidentsTitle" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable"><div class="modal-content">
        <div class="modal-header"><div><p class="eyebrow mb-1">SEGUIMIENTO</p><h2 class="modal-title fs-5" id="deviceIncidentsTitle">Incidencias del dispositivo</h2></div><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button></div>
        <div class="modal-body"><div id="deviceIncidentsContent" class="loading-state">Cargando incidencias…</div></div>
        <div class="modal-footer"><a class="btn btn-primary" href="/incidencias">Ir a incidencias</a><button type="button" class="btn btn-light" data-bs-dismiss="modal">Cerrar</button></div>
    </div></div>
</div>
>>>>>>> 6b1b0fe43da5500cc23cabc3006ef13f0e7c5369
<?php require __DIR__ . '/layout/footer.php'; ?>
