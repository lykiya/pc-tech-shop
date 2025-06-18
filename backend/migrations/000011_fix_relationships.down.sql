
-- Удаляем внешние ключи для OrderItem
ALTER TABLE order_items
    DROP CONSTRAINT IF EXISTS fk_order_item_build;

-- Удаляем внешние ключи для CartItem
ALTER TABLE cart_items
    DROP CONSTRAINT IF EXISTS fk_cart_item_build; 