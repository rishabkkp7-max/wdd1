CREATE DATABASE IF NOT EXISTS food_ordering_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE food_ordering_system;

CREATE TABLE categories (
  category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(80) NOT NULL UNIQUE,
  category_image VARCHAR(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB;

CREATE TABLE food_items (
  food_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  food_name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) UNSIGNED NOT NULL,
  image VARCHAR(500) NOT NULL DEFAULT '',
  availability TINYINT(1) NOT NULL DEFAULT 1,
  INDEX idx_food_category_availability (category_id, availability),
  CONSTRAINT fk_food_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE customers (
  customer_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(190) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customer_mobile (mobile), INDEX idx_customer_email (email)
) ENGINE=InnoDB;

CREATE TABLE orders (
  order_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(40) NOT NULL UNIQUE,
  bill_number VARCHAR(40) NOT NULL UNIQUE,
  customer_id INT UNSIGNED NOT NULL,
  subtotal DECIMAL(10,2) UNSIGNED NOT NULL,
  gst_amount DECIMAL(10,2) UNSIGNED NOT NULL,
  delivery_charge DECIMAL(10,2) UNSIGNED NOT NULL,
  grand_total DECIMAL(10,2) UNSIGNED NOT NULL,
  payment_status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  order_status VARCHAR(30) NOT NULL DEFAULT 'Received',
  special_instructions TEXT NULL,
  order_datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_customer (customer_id), INDEX idx_order_datetime (order_datetime),
  CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE order_items (
  order_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  food_id INT UNSIGNED NOT NULL,
  food_name VARCHAR(120) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(10,2) UNSIGNED NOT NULL,
  item_total DECIMAL(10,2) UNSIGNED NOT NULL,
  INDEX idx_item_order (order_id),
  CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_item_food FOREIGN KEY (food_id) REFERENCES food_items(food_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

INSERT INTO categories (category_name, category_image) VALUES
('Burgers','🍔'),('Pizza','🍕'),('Sandwiches','🥪'),('Indian Food','🍛'),('Chinese Food','🍜'),('Beverages','🥤'),('Desserts','🍰');

INSERT INTO food_items (category_id, food_name, description, price, image) VALUES
(1,'Classic Veg Burger','Crispy veggie patty, fresh lettuce and house sauce.',99,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85'),
(1,'Cheese Burger','Golden veg patty with melted cheese and pickles.',129,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85'),
(1,'Double Patty Burger','Two hearty patties, cheese and smoky sauce.',169,'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85'),
(2,'Margherita Pizza','Classic tomato, mozzarella and fragrant basil.',149,'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85'),
(2,'Farmhouse Pizza','Loaded with peppers, onion, mushrooms and cheese.',249,'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85'),
(2,'Paneer Tikka Pizza','Tandoori paneer, capsicum and a rich tikka base.',279,'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=900&q=85'),
(3,'Veg Sandwich','Fresh seasonal vegetables and herb mayo on soft bread.',89,'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=85'),
(3,'Grilled Cheese Sandwich','Toasted sourdough with a gooey cheese blend.',119,'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?auto=format&fit=crop&w=900&q=85'),
(4,'Paneer Butter Masala','Paneer simmered in a creamy tomato and butter gravy.',199,'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=85'),
(4,'Veg Biryani','Aromatic basmati rice layered with spiced vegetables.',159,'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy%2Cf_auto%2Cq_auto/FOOD_CATALOG/IMAGES/CMS/2025/5/8/fa70ff7c-e8d6-4e28-a258-4c94cf397f8c_349e2414-51ab-4d17-9e6f-26e14068f47f.jpg'),
(5,'Veg Hakka Noodles','Wok-tossed noodles with crisp vegetables.',139,'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=900&q=85'),
(5,'Veg Fried Rice','Fragrant rice with vegetables and a hint of garlic.',129,'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85'),
(6,'Cold Coffee','Chilled, creamy coffee blended to order.',89,'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85'),
(6,'Fresh Lime Soda','Fresh lime, soda and a touch of sweetness.',59,'https://restaurantindia.s3.ap-south-1.amazonaws.com/s3fs-public/inline-images/Fresh%20Lime%20Soda%20%28Salted%2C%20No%20Sugar%29.jpg'),
(7,'Chocolate Brownie','Warm, fudgy chocolate brownie with a crisp top.',99,'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85');
