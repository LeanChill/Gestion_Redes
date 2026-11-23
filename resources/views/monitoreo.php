<?php
$titulo = $titulo ?? 'Monitoreo en Tiempo Real de la Red';
$pageScript = '/assets/js/monitoreo.js';
require __DIR__ . '/layout/header.php';
?>
<section class="page-heading d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
    <div><p class="eyebrow mb-2">CONECTIVIDAD</p><h1 class="h2 mb-1">Monitoreo en tiempo real</h1><p class="text-secondary mb-0">Ejecuta comprobaciones y consulta el historial reciente.</p></div>
    <button class="btn btn-primary" id="pingAllButton"><i class="bi bi-broadcast me-2"></i>Comprobar toda la red</button>
</section>
<section class="content-card mt-4">
    <div class="section-title-row flex-wrap"><div><p class="eyebrow mb-1">HISTORIAL</p><h2 class="h5 mb-0">Comprobaciones recientes</h2></div><div class="d-flex flex-wrap gap-2 align-items-center"><label class="visually-hidden" for="monitorDeviceFilter">Filtrar por dispositivo</label><select class="form-select form-select-sm filter-select" id="monitorDeviceFilter"><option value="">Todos los dispositivos</option></select><button class="btn btn-sm btn-light" id="reloadMonitor"><i class="bi bi-arrow-clockwise me-1"></i>Actualizar</button></div></div>
    <div class="table-responsive">
        <table class="table align-middle app-table mb-0">
            <thead><tr><th>ID</th><th>Dispositivo</th><th>Conexión</th><th>Latencia</th><th>CPU</th><th>Memoria</th><th>Fecha</th><th class="text-end">Acción</th></tr></thead>
            <tbody id="monitorTable"><tr><td colspan="8"><div class="loading-state"><span class="spinner-border spinner-border-sm me-2"></span>Cargando historial…</div></td></tr></tbody>
        </table>
    </div>
    <p class="small text-secondary mt-3 mb-0"><i class="bi bi-info-circle me-1"></i>CPU y memoria se mostrarán cuando el endpoint incluya esos datos.</p>
</section>
<?php require __DIR__ . '/layout/footer.php'; ?>
