USE food_ordering_system;

-- Run once in phpMyAdmin to update the two image URLs in an existing installation.
UPDATE food_items
SET image = 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy%2Cf_auto%2Cq_auto/FOOD_CATALOG/IMAGES/CMS/2025/5/8/fa70ff7c-e8d6-4e28-a258-4c94cf397f8c_349e2414-51ab-4d17-9e6f-26e14068f47f.jpg'
WHERE food_name = 'Veg Biryani';

UPDATE food_items
SET image = 'https://restaurantindia.s3.ap-south-1.amazonaws.com/s3fs-public/inline-images/Fresh%20Lime%20Soda%20%28Salted%2C%20No%20Sugar%29.jpg'
WHERE food_name = 'Fresh Lime Soda';
