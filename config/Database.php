<?php

namespace Config;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $connection = null;

    /**
     * Obtiene una instancia única de conexión PDO (Patrón Singleton).
     *
     * @return PDO
     * @throws PDOException
     */
    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
            $port = $_ENV['DB_PORT'] ?? '3306';
            $db   = $_ENV['DB_NAME'] ?? 'gestion_redes';
            $user = $_ENV['DB_USER'] ?? 'root';
            $pass = $_ENV['DB_PASS'] ?? '';
            $charset = $_ENV['DB_CHARSET'] ?? 'utf8mb4';

            $dsn = "mysql:host={$host};port={$port};dbname={$db};charset={$charset}";

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_PERSISTENT         => false,
            ];

            try {
                self::$connection = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                // Registrar o relanzar la excepción controlada
                throw new PDOException("Error de conexión a la base de datos: " . $e->getMessage(), (int)$e->getCode());
            }
        }

        return self::$connection;
    }

    /**
     * Verifica el estado de la conexión a la base de datos.
     * Útil para endpoints de healthcheck y diagnóstico inicial.
     *
     * @return array
     */
    public static function testConnection(): array
    {
        try {
            $pdo = self::getConnection();
            $stmt = $pdo->query('SELECT VERSION() as version');
            $version = $stmt->fetchColumn();

            return [
                'status' => 'ok',
                'connected' => true,
                'database' => $_ENV['DB_NAME'] ?? 'gestion_redes',
                'server_version' => $version
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'error',
                'connected' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}
