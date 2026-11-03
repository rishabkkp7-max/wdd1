<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
require_once __DIR__ . '/../config/database.php';

function respond(int $status, array $body): never { http_response_code($status); echo json_encode($body, JSON_UNESCAPED_UNICODE); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['success'=>false,'message'=>'POST required.']);
$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) respond(400, ['success'=>false,'message'=>'Invalid request body.']);
$name = trim((string)($data['customer']['full_name'] ?? ''));
$mobile = preg_replace('/\s+/', '', (string)($data['customer']['mobile'] ?? ''));
$email = trim((string)($data['customer']['email'] ?? ''));
$address = trim((string)($data['customer']['address'] ?? ''));
$city = trim((string)($data['customer']['city'] ?? ''));
$pincode = trim((string)($data['customer']['pincode'] ?? ''));
$instructions = trim((string)($data['customer']['special_instructions'] ?? ''));
$cart = $data['items'] ?? null;
if ($name === '' || mb_strlen($name) > 120) respond(422,['success'=>false,'message'=>'Enter a valid full name (up to 120 characters).']);
if (!preg_match('/^[+]?[0-9]{10,15}$/', $mobile)) respond(422,['success'=>false,'message'=>'Enter a valid mobile number (10–15 digits).']);
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email)>190) respond(422,['success'=>false,'message'=>'Enter a valid email address.']);
if ($address === '' || mb_strlen($address)>2000 || $city === '' || mb_strlen($city)>100) respond(422,['success'=>false,'message'=>'Enter a valid delivery address and city.']);
if (!preg_match('/^[0-9]{6}$/', $pincode)) respond(422,['success'=>false,'message'=>'Enter a valid 6-digit Indian pincode.']);
if (!is_array($cart) || count($cart)<1 || count($cart)>30) respond(422,['success'=>false,'message'=>'Your cart is empty or has too many distinct items.']);
$quantities=[];
foreach ($cart as $line) {
    $id = filter_var($line['food_id'] ?? null, FILTER_VALIDATE_INT);
    $quantity = filter_var($line['quantity'] ?? null, FILTER_VALIDATE_INT);
    if (!$id || !$quantity || $quantity<1 || $quantity>50) respond(422,['success'=>false,'message'=>'Cart contains an invalid item or quantity.']);
    $quantities[$id] = ($quantities[$id] ?? 0) + $quantity;
    if ($quantities[$id]>50) respond(422,['success'=>false,'message'=>'Maximum quantity per item is 50.']);
}
try {
    $pdo->beginTransaction();
    $ids = array_keys($quantities);
    $marks = implode(',', array_fill(0,count($ids),'?'));
    $stmt=$pdo->prepare("SELECT food_id, food_name, price FROM food_items WHERE availability=1 AND food_id IN ({$marks}) FOR UPDATE");
    $stmt->execute($ids); $foods=$stmt->fetchAll();
    if (count($foods)!==count($ids)) { $pdo->rollBack(); respond(409,['success'=>false,'message'=>'One or more items are no longer available. Refresh the menu and try again.']); }
    $subtotal=0.0;
    foreach ($foods as &$food) { $food['quantity']=$quantities[(int)$food['food_id']]; $food['unit_price']=(float)$food['price']; $food['item_total']=round($food['unit_price']*$food['quantity'],2); $subtotal += $food['item_total']; }
    unset($food);
    $subtotal=round($subtotal,2); $gst=round($subtotal*0.05,2); $delivery=30.00; $grand=round($subtotal+$gst+$delivery,2);
    $stmt=$pdo->prepare('INSERT INTO customers (full_name,mobile,email,address,city,pincode) VALUES (?,?,?,?,?,?)');
    $stmt->execute([$name,$mobile,$email,$address,$city,$pincode]); $customerId=(int)$pdo->lastInsertId();
    $orderNumber='ORD'.date('ymd').strtoupper(bin2hex(random_bytes(4)));
    $billNumber='BIL'.date('ymd').strtoupper(bin2hex(random_bytes(4)));
    $stmt=$pdo->prepare("INSERT INTO orders (order_number,bill_number,customer_id,subtotal,gst_amount,delivery_charge,grand_total,special_instructions) VALUES (?,?,?,?,?,?,?,?)");
    $stmt->execute([$orderNumber,$billNumber,$customerId,$subtotal,$gst,$delivery,$grand,$instructions ?: null]); $orderId=(int)$pdo->lastInsertId();
    $itemStmt=$pdo->prepare('INSERT INTO order_items (order_id,food_id,food_name,quantity,unit_price,item_total) VALUES (?,?,?,?,?,?)');
    foreach ($foods as $food) $itemStmt->execute([$orderId,$food['food_id'],$food['food_name'],$food['quantity'],$food['unit_price'],$food['item_total']]);
    $pdo->commit();
    respond(201,['success'=>true,'message'=>'Your order has been placed.','order'=>['order_number'=>$orderNumber,'bill_number'=>$billNumber,'customer_name'=>$name,'order_datetime'=>date('Y-m-d H:i:s'),'subtotal'=>$subtotal,'gst_amount'=>$gst,'delivery_charge'=>$delivery,'grand_total'=>$grand,'order_status'=>'Received','items'=>$foods]]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log('Order placement failed: '.$e->getMessage());
    respond(500,['success'=>false,'message'=>'We could not place your order. Please try again.']);
}
