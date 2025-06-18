-- Откат миграции для таблицы orders
-- Удаляем добавленные поля

-- Удаляем поля для контактной информации и доставки
ALTER TABLE orders DROP COLUMN IF EXISTS shipping_address;
ALTER TABLE orders DROP COLUMN IF EXISTS payment_method;
ALTER TABLE orders DROP COLUMN IF EXISTS delivery_method;
ALTER TABLE orders DROP COLUMN IF EXISTS comment;

-- Удаляем поля GORM
ALTER TABLE orders DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE orders DROP COLUMN IF EXISTS updated_at;
ALTER TABLE orders DROP COLUMN IF EXISTS created_at;

-- Переименовываем total_amount обратно в total_price если нужно
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
        ALTER TABLE orders RENAME COLUMN total_amount TO total_price;
    END IF;
END $$; 