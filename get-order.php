<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/database.php';
$number = trim((string)($_GET['order_number'] ?? ''));
if (!preg_match('/^ORD[0-9]{6}[A-F0-9]{8}$/i',$number)) { http_response_code(422); echo json_encode(['success'=>false,'message'=>'Enter a valid order number.']); exit; }
$stmt=$pdo->prepare('SELECT o.order_number,o.bill_number,o.subtotal,o.gst_amount,o.delivery_charge,o.grand_total,o.order_status,o.order_datetime,c.full_name,c.mobile,c.email,c.address,c.city,c.pincode FROM orders o JOIN customers c ON c.customer_id=o.customer_id WHERE o.order_number=?');
$stmt->execute([$number]); $order=$stmt->fetch();
if (!$order) { http_response_code(404); echo json_encode(['success'=>false,'message'=>'No order was found with that number.']); exit; }
$stmt=$pdo->prepare('SELECT food_name,quantity,unit_price,item_total FROM order_items WHERE order_id=(SELECT order_id FROM orders WHERE order_number=?) ORDER BY order_item_id');
$stmt->execute([$number]); $order['items']=$stmt->fetchAll();
echo json_encode(['success'=>true,'order'=>$order],JSON_UNESCAPED_UNICODE);
