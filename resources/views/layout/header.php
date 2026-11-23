<?php
$pageTitle = isset($titulo) ? (string) $titulo : 'Gestión de Red';
$currentPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$navItems = [
    '/' => ['Dashboard', 'bi-grid-1x2'],
    '/dispositivos' => ['Dispositivos', 'bi-hdd-network'],
    '/monitoreo' => ['Monitoreo', 'bi-activity'],
    '/incidencias' => ['Incidencias', 'bi-exclamation-triangle'],
];
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f5f7fb">
    <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="/assets/css/app.css" rel="stylesheet">
</head>
<body>
<nav class="navbar navbar-expand-lg app-navbar sticky-top">
    <div class="container-fluid app-container">
        <a class="navbar-brand fw-semibold d-flex align-items-center gap-2" href="/">
            <span class="brand-mark"><i class="bi bi-router-fill"></i></span>
            <span>Red<span class="text-primary">Local</span></span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavigation" aria-controls="mainNavigation" aria-expanded="false" aria-label="Abrir navegación">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNavigation">
            <ul class="navbar-nav me-auto ms-lg-4">
                <?php foreach ($navItems as $path => [$label, $icon]): ?>
                    <li class="nav-item">
                        <a class="nav-link <?= $currentPath === $path ? 'active' : '' ?>" <?= $currentPath === $path ? 'aria-current="page"' : '' ?> href="<?= htmlspecialchars($path, ENT_QUOTES, 'UTF-8') ?>">
                            <i class="bi <?= htmlspecialchars($icon, ENT_QUOTES, 'UTF-8') ?> me-1"></i><?= htmlspecialchars($label, ENT_QUOTES, 'UTF-8') ?>
                        </a>
                    </li>
                <?php endforeach; ?>
            </ul>
            <span id="apiHealthBadge" class="badge rounded-pill text-bg-secondary health-badge" role="status" aria-live="polite">
                <span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span> Verificando conexión
            </span>
        </div>
    </div>
</nav>
<main class="container-fluid app-container py-4 py-lg-5">
    <div id="globalAlerts" class="mb-3" aria-live="polite"></div>
