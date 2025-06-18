-- Откат миграции для таблицы order_items
-- Удаляем добавленные поля

-- Удаляем поля GORM
ALTER TABLE order_items DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE order_items DROP COLUMN IF EXISTS updated_at;
ALTER TABLE order_items DROP COLUMN IF EXISTS created_at;

-- Удаляем обязательные поля (если они были добавлены)
ALTER TABLE order_items DROP COLUMN IF EXISTS price;
ALTER TABLE order_items DROP COLUMN IF EXISTS quantity;
ALTER TABLE order_items DROP COLUMN IF EXISTS build_id;
ALTER TABLE order_items DROP COLUMN IF EXISTS order_id; 