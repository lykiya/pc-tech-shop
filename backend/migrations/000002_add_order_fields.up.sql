-- Добавляем новые поля как nullable
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS comment TEXT;

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