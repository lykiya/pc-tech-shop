-- Удаляем дублирующиеся колонки
ALTER TABLE pcbuild 
    DROP COLUMN IF EXISTS powerunitid,
    DROP COLUMN IF EXISTS hddid,
    DROP COLUMN IF EXISTS ssdid; 