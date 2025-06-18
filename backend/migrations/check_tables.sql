-- Скрипт для проверки структуры таблиц orders и order_items
-- Выполните этот скрипт после применения миграций

-- Проверяем структуру таблицы orders
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Проверяем структуру таблицы order_items
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- Проверяем ограничения внешних ключей
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('orders', 'order_items');

-- Проверяем индексы
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('orders', 'order_items')
ORDER BY tablename, indexname;

-- Проверяем количество записей в таблицах
SELECT 'orders' as table_name, COUNT(*) as record_count FROM orders
UNION ALL
SELECT 'order_items' as table_name, COUNT(*) as record_count FROM order_items; 