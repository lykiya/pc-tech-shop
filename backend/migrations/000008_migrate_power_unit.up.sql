-- Копируем данные из powerunit в power_unit
INSERT INTO power_unit (id, name, wattage, price)
SELECT id, name, wattage, price
FROM powerunit;

-- Удаляем старую таблицу powerunit
DROP TABLE IF EXISTS powerunit; 