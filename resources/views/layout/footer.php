</main>
<footer class="app-footer">
    <div class="container-fluid app-container d-flex flex-column flex-sm-row justify-content-between gap-1">
        <span>Sistema de Gestión de Dispositivos de Red Local</span>
        <span class="text-secondary">Panel de administración</span>
    </div>
</footer>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="/assets/js/app.js"></script>
<?php if (!empty($pageScript)): ?>
    <script src="<?= htmlspecialchars((string) $pageScript, ENT_QUOTES, 'UTF-8') ?>"></script>
<?php endif; ?>
</body>
</html>
