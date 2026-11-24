<?php
$titulo = $titulo ?? 'Panel Principal - Gestión de Red';
$pageScript = '/assets/js/dashboard.js';
require __DIR__ . '/layout/header.php';
?>
<section class="page-heading d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
    <div>
        <p class="eyebrow mb-2">VISTA GENERAL</p>
<<<<<<< HEAD
        <h1 class="h2 mb-1">Inicio</h1>
=======
        <h1 class="h2 mb-1">Dashboard</h1>
>>>>>>> 6b1b0fe43da5500cc23cabc3006ef13f0e7c5369
        <p class="text-secondary mb-0">Resumen del estado de tu infraestructura de red.</p>
    </div>
    <a class="btn btn-primary" href="/dispositivos"><i class="bi bi-plus-lg me-2"></i>Gestionar dispositivos</a>
</section>

<section class="row g-3 g-xl-4 mt-2" aria-label="Métricas">
    <div class="col-12 col-sm-6 col-xl-3">
        <article class="metric-card"><div class="metric-icon icon-blue"><i class="bi bi-hdd-network"></i></div><p class="metric-label">Dispositivos registrados</p><p id="metricDevices" class="metric-value">—</p><small class="text-secondary">Inventario total</small></article>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <article class="metric-card"><div class="metric-icon icon-green"><i class="bi bi-wifi"></i></div><p class="metric-label">En línea</p><p id="metricOnline" class="metric-value">—</p><small class="text-secondary">Conectividad confirmada</small></article>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <article class="metric-card"><div class="metric-icon icon-red"><i class="bi bi-wifi-off"></i></div><p class="metric-label">Fuera de línea</p><p id="metricOffline" class="metric-value">—</p><small class="text-secondary">Requieren revisión</small></article>
    </div>
    <div class="col-12 col-sm-6 col-xl-3">
        <article class="metric-card"><div class="metric-icon icon-amber"><i class="bi bi-exclamation-diamond"></i></div><p class="metric-label">Incidencias abiertas</p><p id="metricOpenIncidents" class="metric-value">—</p><small class="text-secondary">Pendientes de atención</small></article>
    </div>
</section>

<section class="row g-3 g-xl-4 mt-1">
    <div class="col-12 col-xl-7">
        <div class="content-card h-100">
            <div class="section-title-row"><div><p class="eyebrow mb-1">ACTIVIDAD</p><h2 class="h5 mb-0">Actividad reciente</h2></div><a class="btn btn-sm btn-light" href="/monitoreo">Ver monitoreo <i class="bi bi-arrow-up-right ms-1"></i></a></div>
            <div id="recentActivity" class="activity-list"><div class="loading-state"><span class="spinner-border spinner-border-sm me-2"></span>Cargando actividad…</div></div>
        </div>
    </div>
    <div class="col-12 col-xl-5">
        <div class="content-card h-100">
            <div class="section-title-row"><div><p class="eyebrow mb-1">ACCESOS DIRECTOS</p><h2 class="h5 mb-0">Módulos</h2></div></div>
            <div class="quick-links">
                <a class="quick-link" href="/dispositivos"><span class="quick-link-icon icon-blue"><i class="bi bi-hdd-network"></i></span><span><strong>Dispositivos</strong><small>Inventario y configuración</small></span><i class="bi bi-chevron-right ms-auto"></i></a>
                <a class="quick-link" href="/monitoreo"><span class="quick-link-icon icon-green"><i class="bi bi-activity"></i></span><span><strong>Monitoreo</strong><small>Conectividad e historial</small></span><i class="bi bi-chevron-right ms-auto"></i></a>
                <a class="quick-link" href="/incidencias"><span class="quick-link-icon icon-amber"><i class="bi bi-exclamation-triangle"></i></span><span><strong>Incidencias</strong><small>Registro y seguimiento</small></span><i class="bi bi-chevron-right ms-auto"></i></a>
            </div>
        </div>
    </div>
</section>
<?php require __DIR__ . '/layout/footer.php'; ?>
