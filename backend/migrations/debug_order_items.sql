-- Диагностика таблицы order_items
-- Выполните этот скрипт для проверки текущей структуры

-- Проверяем, существует ли таблица
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'order_items'
) as table_exists;

-- Если таблица существует, показываем её структуру
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- Показываем все таблицы, содержащие "order" в названии
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%order%'
ORDER BY table_name; 