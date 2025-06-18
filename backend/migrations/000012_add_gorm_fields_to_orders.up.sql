-- Добавляем поля GORM в таблицу orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Добавляем поля GORM в таблицу order_items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Переименовываем поля для соответствия модели GORM
ALTER TABLE orders RENAME COLUMN total_price TO total_amount;
ALTER TABLE orders RENAME COLUMN order_date TO created_at;

-- Обновляем существующие записи
UPDATE orders SET 
    created_at = COALESCE(order_date, CURRENT_TIMESTAMP),
    updated_at = CURRENT_TIMESTAMP
WHERE created_at IS NULL; 