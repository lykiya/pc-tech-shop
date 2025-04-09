-- Проверяем и исправляем данные в таблице pcbuild
UPDATE pcbuild 
SET power_unit_id = 1,
    ssd_id = 1
WHERE power_unit_id = 0 OR ssd_id = 0;

-- Проверяем, что все внешние ключи корректны
ALTER TABLE pcbuild
    ADD CONSTRAINT fk_power_unit
    FOREIGN KEY (power_unit_id)
    REFERENCES power_unit(id),
    ADD CONSTRAINT fk_ssd
    FOREIGN KEY (ssd_id)
    REFERENCES ssd(id); 