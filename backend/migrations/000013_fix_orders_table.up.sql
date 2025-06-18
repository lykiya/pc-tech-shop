-- Миграция для исправления таблицы orders
-- Добавляем недостающие поля, если их нет

-- Добавляем поля для контактной информации и доставки
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS comment TEXT;

-- Добавляем поля GORM, если их нет
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Убеждаемся, что поле total_amount существует (переименовываем total_price если нужно)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_price') THEN
        ALTER TABLE orders RENAME COLUMN total_price TO total_amount;
    END IF;
END $$;

-- Обновляем существующие записи значениями по умолчанию
UPDATE orders SET 
    shipping_address = COALESCE(shipping_address, 'Не указан'),
    payment_method = COALESCE(payment_method, 'Не указан'),
    delivery_method = COALESCE(delivery_method, 'Не указан'),
    comment = COALESCE(comment, ''),
    created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    updated_at = CURRENT_TIMESTAMP
WHERE shipping_address IS NULL OR payment_method IS NULL OR delivery_method IS NULL;

-- Делаем обязательные поля NOT NULL
ALTER TABLE orders ALTER COLUMN shipping_address SET NOT NULL;
ALTER TABLE orders ALTER COLUMN payment_method SET NOT NULL;
ALTER TABLE orders ALTER COLUMN delivery_method SET NOT NULL;
ALTER TABLE orders ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE orders ALTER COLUMN updated_at SET NOT NULL; 