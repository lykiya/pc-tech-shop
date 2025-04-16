-- Удаляем внешние ключи для компонентов PC
ALTER TABLE pcs
    DROP CONSTRAINT IF EXISTS fk_pc_cpu,
    DROP CONSTRAINT IF EXISTS fk_pc_gpu,
    DROP CONSTRAINT IF EXISTS fk_pc_motherboard,
    DROP CONSTRAINT IF EXISTS fk_pc_ram,
    DROP CONSTRAINT IF EXISTS fk_pc_power_unit,
    DROP CONSTRAINT IF EXISTS fk_pc_body,
    DROP CONSTRAINT IF EXISTS fk_pc_hdd,
    DROP CONSTRAINT IF EXISTS fk_pc_ssd;

-- Удаляем внешние ключи для OrderItem
ALTER TABLE order_items
    DROP CONSTRAINT IF EXISTS fk_order_item_build;

-- Удаляем внешние ключи для CartItem
ALTER TABLE cart_items
    DROP CONSTRAINT IF EXISTS fk_cart_item_build; 