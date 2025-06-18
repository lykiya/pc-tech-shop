-- Миграция для исправления таблицы order_items
-- Добавляем недостающие поля, если их нет

-- Добавляем поля GORM, если их нет
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Убеждаемся, что все обязательные поля существуют
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS build_id INTEGER REFERENCES builds(id) ON DELETE CASCADE;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Обновляем существующие записи значениями по умолчанию
UPDATE order_items SET 
    created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    updated_at = CURRENT_TIMESTAMP,
    quantity = COALESCE(quantity, 1),
    price = COALESCE(price, 0)
WHERE created_at IS NULL OR quantity IS NULL OR price IS NULL;

-- Делаем обязательные поля NOT NULL
ALTER TABLE order_items ALTER COLUMN order_id SET NOT NULL;
ALTER TABLE order_items ALTER COLUMN build_id SET NOT NULL;
ALTER TABLE order_items ALTER COLUMN quantity SET NOT NULL;
ALTER TABLE order_items ALTER COLUMN price SET NOT NULL;
ALTER TABLE order_items ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE order_items ALTER COLUMN updated_at SET NOT NULL; 