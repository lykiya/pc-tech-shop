-- Скрипт для проверки и исправления структуры таблицы order_items

-- Проверяем текущую структуру таблицы order_items
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- Проверяем, есть ли таблица order_items
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'order_items'
) as table_exists;

-- Если таблица существует, но имеет неправильную структуру, удаляем её
DROP TABLE IF EXISTS order_items CASCADE;

-- Создаем таблицу order_items с правильной структурой
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

-- Проверяем созданную структуру
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- Проверяем индексы
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename = 'order_items'
ORDER BY indexname; 