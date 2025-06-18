-- Удаляем поле quantity из таблицы cart_items
ALTER TABLE cart_items DROP COLUMN IF EXISTS quantity; 