<?php

namespace App\Repositories;

use Config\Database;
use PDO;

class MonitoreoRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function registrar(int $dispositivoId, string $estado, ?int $latenciaMs, ?string $detalles = null): int
    {
        $sql = "INSERT INTO monitoreos (dispositivo_id, estado, latencia_ms, detalles) 
                VALUES (:dispositivo_id, :estado, :latencia_ms, :detalles)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'dispositivo_id' => $dispositivoId,
            'estado'         => $estado,
            'latencia_ms'    => $latenciaMs,
            'detalles'       => $detalles
        ]);

        return (int)$this->db->lastInsertId();
    }

    public function findUltimos(int $limit = 20): array
    {
        $sql = "SELECT m.*, d.nombre as dispositivo_nombre, d.ip as dispositivo_ip, d.tipo as dispositivo_tipo 
                FROM monitoreos m 
                INNER JOIN dispositivos d ON d.id = m.dispositivo_id 
                ORDER BY m.id DESC 
                LIMIT :limit";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function findPorDispositivo(int $dispositivoId, int $limit = 10): array
    {
        $sql = "SELECT * FROM monitoreos 
                WHERE dispositivo_id = :dispositivo_id 
                ORDER BY id DESC 
                LIMIT :limit";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':dispositivo_id', $dispositivoId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
