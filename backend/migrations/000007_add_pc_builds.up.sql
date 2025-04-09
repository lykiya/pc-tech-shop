-- Добавляем новые сборки ПК с существующими ID компонентов
INSERT INTO pcbuild (name, description, cpu_id, gpu_id, motherboard_id, body_id, ram_id, power_unit_id, hdd_id, ssd_id, total_price, image_url) VALUES
('Gaming Pro', 'Мощный игровой ПК для 4K гейминга с RTX 4080 и Ryzen 9 7950X', 1, 1, 1, 1, 1, 1, 1, 1, 5999.99, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Creator Workstation', 'Профессиональная рабочая станция для 3D-рендеринга и видеомонтажа', 2, 2, 2, 2, 2, 2, 2, 2, 4999.99, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Budget Gaming', 'Доступный игровой ПК для 1080p гейминга', 3, 3, 3, 3, 3, 3, 3, 3, 1999.99, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Streaming Setup', 'Оптимальная сборка для стриминга и контент-мейкинга', 4, 4, 4, 4, 4, 4, 4, 4, 3499.99, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Home Office', 'Надежный ПК для работы и учебы', 5, 5, 5, 5, 5, 5, 5, 5, 1499.99, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'); 