-- Удаляем существующие колонки, если они есть
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_address;
ALTER TABLE orders DROP COLUMN IF EXISTS payment_method;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_method;
ALTER TABLE orders DROP COLUMN IF EXISTS comment;

-- Добавляем новые поля
ALTER TABLE orders ADD COLUMN shipping_address TEXT;
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN delivery_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN comment TEXT;

-- Обновляем существующие записи значениями по умолчанию
UPDATE orders SET 
    shipping_address = 'Не указан',
    payment_method = 'Не указан',
    delivery_method = 'Не указан'
WHERE shipping_address IS NULL;

-- Делаем поля NOT NULL после обновления
ALTER TABLE orders ALTER COLUMN shipping_address SET NOT NULL;
ALTER TABLE orders ALTER COLUMN payment_method SET NOT NULL;
ALTER TABLE orders ALTER COLUMN delivery_method SET NOT NULL; 