-- Удаляем лишний столбец build_id
ALTER TABLE cart_items DROP COLUMN IF EXISTS build_id; 