-- Упрощаем таблицу order_items, убирая поля GORM
-- Сначала удаляем существующую таблицу, если она есть
DROP TABLE IF EXISTS order_items CASCADE;

-- Создаем таблицу order_items с простой структурой
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    pcbuild_id INTEGER NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- Создаем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_pcbuild_id ON order_items(pcbuild_id); 