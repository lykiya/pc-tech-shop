-- Откат изменений для таблицы orders
ALTER TABLE orders RENAME COLUMN total_amount TO total_price;
ALTER TABLE orders RENAME COLUMN created_at TO order_date;

-- Удаляем поля GORM из таблицы orders
ALTER TABLE orders DROP COLUMN IF EXISTS updated_at;
ALTER TABLE orders DROP COLUMN IF EXISTS deleted_at;

-- Удаляем поля GORM из таблицы order_items
ALTER TABLE order_items DROP COLUMN IF EXISTS created_at;
ALTER TABLE order_items DROP COLUMN IF EXISTS updated_at;
ALTER TABLE order_items DROP COLUMN IF EXISTS deleted_at; 