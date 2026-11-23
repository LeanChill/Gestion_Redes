<?php
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
<?php require __DIR__ . '/layout/footer.php'; ?>
