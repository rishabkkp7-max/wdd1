<?php
declare(strict_types=1);
date_default_timezone_set('Asia/Kolkata');

// Local XAMPP defaults. Override with environment variables on hosted systems.
$host = getenv('DB_HOST') ?: '127.0.0.1';
$dbname = getenv('DB_NAME') ?: 'food_ordering_system';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') ?: '';
$port = getenv('DB_PORT') ?: '3306';
$dsn = getenv('DB_DSN') ?: "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
$sslCaPath = getenv('DB_SSL_CA_PATH') ?: '';

$pdoOptions = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];
if ($sslCaPath !== '') {
    if (!is_file($sslCaPath)) {
        error_log('Configured database CA certificate file was not found.');
        http_response_code(503);
        exit('Database TLS configuration is invalid.');
    }
    $pdoOptions[PDO::MYSQL_ATTR_SSL_CA] = $sslCaPath;
}

try {
    $pdo = new PDO($dsn, $username, $password, $pdoOptions);
    $pdo->exec("SET time_zone = '+05:30'");
} catch (PDOException $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    if (str_contains($_SERVER['SCRIPT_NAME'] ?? '', '/api/')) {
        http_response_code(503);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'message' => 'The menu is temporarily unavailable. Check the database setup.']);
        exit;
    }
    http_response_code(503);
    exit('Database unavailable. Start MySQL in XAMPP and import database/database.sql.');
}
