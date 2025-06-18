-- Проверяем данные компонентов
SELECT 'CPU' as component_type, id, name, price FROM cpu LIMIT 5;
SELECT 'GPU' as component_type, id, name, price FROM gpu LIMIT 5;
SELECT 'Motherboard' as component_type, id, name, price FROM motherboard LIMIT 5;
SELECT 'RAM' as component_type, id, name, price FROM ram LIMIT 5;
SELECT 'PowerUnit' as component_type, id, name, price FROM power_unit LIMIT 5;
SELECT 'Body' as component_type, id, name, price FROM body LIMIT 5;
SELECT 'HDD' as component_type, id, name, price FROM hdd LIMIT 5;
SELECT 'SSD' as component_type, id, name, price FROM ssd LIMIT 5; 