-- Откат миграции для таблицы order_items
-- Удаляем таблицу order_items
DROP TABLE IF EXISTS order_items CASCADE; 