-- Переименовываем столбцы в соответствии с моделью
ALTER TABLE pcbuild 
    RENAME COLUMN powerunitid TO power_unit_id,
    RENAME COLUMN hddid TO hdd_id,
    RENAME COLUMN ssdid TO ssd_id; 