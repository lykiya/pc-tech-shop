-- Проверяем и исправляем данные в таблице pcbuild
UPDATE pcbuild 
SET power_unit_id = 1,
    hdd_id = 1,
    ssd_id = 1
WHERE power_unit_id IS NULL OR hdd_id IS NULL OR ssd_id IS NULL;

-- Проверяем, что все внешние ключи корректны
ALTER TABLE pcbuild
    ADD CONSTRAINT fk_power_unit
    FOREIGN KEY (power_unit_id)
    REFERENCES power_unit(id),
    ADD CONSTRAINT fk_hdd
    FOREIGN KEY (hdd_id)
    REFERENCES hdd(id),
    ADD CONSTRAINT fk_ssd
    FOREIGN KEY (ssd_id)
    REFERENCES ssd(id);

-- Добавляем тестовую сборку для проверки
INSERT INTO pcbuild (name, description, cpu_id, gpu_id, motherboard_id, body_id, ram_id, power_unit_id, hdd_id, ssd_id, total_price, image_url)
VALUES (
    'Test Build',
    'Тестовая сборка для проверки',
    1, 1, 1, 1, 1, 1, 1, 1,
    2999.99,
    'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'
); 