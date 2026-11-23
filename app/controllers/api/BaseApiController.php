<?php

namespace App\Controllers\Api;

use Psr\Http\Message\ResponseInterface as Response;

abstract class BaseApiController
{
    /**
     * Retorna una respuesta JSON estandarizada.
     */
    protected function json(Response $response, mixed $data, int $status = 200): Response
    {
        $payload = json_encode([
            'success' => ($status >= 200 && $status < 300),
            'data'    => $data,
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        $response->getBody()->write($payload);
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }

    /**
     * Retorna una respuesta de error estandarizada.
     */
    protected function error(Response $response, string $message, int $status = 400, ?array $errors = null): Response
    {
        $payload = json_encode([
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        $response->getBody()->write($payload);
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
