<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/database.php';
$statement = $pdo->query('SELECT f.food_id, f.food_name, f.description, f.price, f.image, f.category_id, c.category_name FROM food_items f JOIN categories c ON c.category_id=f.category_id WHERE f.availability=1 ORDER BY f.food_id');
echo json_encode(['success' => true, 'foods' => $statement->fetchAll()], JSON_UNESCAPED_UNICODE);
