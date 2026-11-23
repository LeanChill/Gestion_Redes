<?php

namespace App\Models;

class Monitoreo
{
    public ?int $id;
    public int $dispositivo_id;
    public string $estado;
    public ?int $latencia_ms;
    public ?string $detalles;
    public ?string $fecha_monitoreo;

    public function __construct(array $data = [])
    {
        $this->id = isset($data['id']) ? (int)$data['id'] : null;
        $this->dispositivo_id = (int)($data['dispositivo_id'] ?? 0);
        $this->estado = $data['estado'] ?? 'desconocido';
        $this->latencia_ms = isset($data['latencia_ms']) ? (int)$data['latencia_ms'] : null;
        $this->detalles = $data['detalles'] ?? null;
        $this->fecha_monitoreo = $data['fecha_monitoreo'] ?? null;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'dispositivo_id' => $this->dispositivo_id,
            'estado' => $this->estado,
            'latencia_ms' => $this->latencia_ms,
            'detalles' => $this->detalles,
            'fecha_monitoreo' => $this->fecha_monitoreo,
        ];
    }
}
