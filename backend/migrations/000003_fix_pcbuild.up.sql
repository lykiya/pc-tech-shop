-- Удаляем дублирующиеся поля
ALTER TABLE pcbuild 
    DROP COLUMN IF EXISTS power_unit_id,
    DROP COLUMN IF EXISTS hdd_id,
    DROP COLUMN IF EXISTS ssd_id;

-- Переименовываем поля для соответствия конвенции именования
ALTER TABLE pcbuild 
    RENAME COLUMN discription TO description,
    RENAME COLUMN powerunitid TO power_unit_id,
    RENAME COLUMN hddid TO hdd_id,
    RENAME COLUMN ssdid TO ssd_id; 