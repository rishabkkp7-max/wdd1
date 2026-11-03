<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/database.php';
$rows = $pdo->query('SELECT category_id, category_name, category_image FROM categories ORDER BY category_id')->fetchAll();
echo json_encode(['success' => true, 'categories' => $rows], JSON_UNESCAPED_UNICODE);
