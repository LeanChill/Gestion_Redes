<?php

use Slim\App;
use App\Controllers\Web\WebController;

return function (App $app) {
    $app->get('/', [WebController::class, 'dashboard']);
    $app->get('/dispositivos', [WebController::class, 'dispositivos']);
    $app->get('/monitoreo', [WebController::class, 'monitoreo']);
    $app->get('/incidencias', [WebController::class, 'incidencias']);
};
