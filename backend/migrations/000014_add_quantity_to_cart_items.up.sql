-- Добавляем поле quantity в таблицу cart_items
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Обновляем существующие записи
UPDATE cart_items SET quantity = 1 WHERE quantity IS NULL;

-- Делаем поле NOT NULL
ALTER TABLE cart_items ALTER COLUMN quantity SET NOT NULL; 