-- Удаляем добавленные поля
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_address;
ALTER TABLE orders DROP COLUMN IF EXISTS payment_method;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_method;
ALTER TABLE orders DROP COLUMN IF EXISTS comment; 