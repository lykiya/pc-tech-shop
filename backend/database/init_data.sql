-- Вставка пользователей
INSERT INTO users (name, email, password, role) VALUES
('Администратор', 'admin@example.com', '$2a$10$X7Q8X9Y0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z', 'admin'),
('Пользователь', 'user@example.com', '$2a$10$X7Q8X9Y0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z', 'user');

-- Вставка процессоров
INSERT INTO cpus (name, price, description, image_url) VALUES
('Intel Core i9-13900K', 59999, 'Процессор Intel Core i9-13900K, 24 ядра, 32 потока, 3.0-5.8 ГГц', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('AMD Ryzen 9 7950X', 54999, 'Процессор AMD Ryzen 9 7950X, 16 ядер, 32 потока, 4.5-5.7 ГГц', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Intel Core i7-13700K', 39999, 'Процессор Intel Core i7-13700K, 16 ядер, 24 потока, 3.4-5.4 ГГц', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('AMD Ryzen 7 7800X3D', 34999, 'Процессор AMD Ryzen 7 7800X3D, 8 ядер, 16 потоков, 4.2-5.0 ГГц', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7');

-- Вставка видеокарт
INSERT INTO gpus (name, price, description, image_url) VALUES
('NVIDIA GeForce RTX 4090', 159999, 'Видеокарта NVIDIA GeForce RTX 4090, 24 ГБ GDDR6X', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('AMD Radeon RX 7900 XTX', 99999, 'Видеокарта AMD Radeon RX 7900 XTX, 24 ГБ GDDR6', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('NVIDIA GeForce RTX 4080', 89999, 'Видеокарта NVIDIA GeForce RTX 4080, 16 ГБ GDDR6X', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('AMD Radeon RX 7900 XT', 79999, 'Видеокарта AMD Radeon RX 7900 XT, 20 ГБ GDDR6', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7');

-- Вставка материнских плат
INSERT INTO motherboards (name, price, description, image_url) VALUES
('ASUS ROG MAXIMUS Z790 HERO', 39999, 'Материнская плата ASUS ROG MAXIMUS Z790 HERO, LGA 1700', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('MSI MEG X670E ACE', 34999, 'Материнская плата MSI MEG X670E ACE, AM5', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('GIGABYTE Z790 AORUS MASTER', 29999, 'Материнская плата GIGABYTE Z790 AORUS MASTER, LGA 1700', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('ASRock X670E Taichi', 27999, 'Материнская плата ASRock X670E Taichi, AM5', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7');

-- Вставка корпусов
INSERT INTO bodies (name, price, description, image_url) VALUES
('Lian Li PC-O11 Dynamic', 12999, 'Корпус Lian Li PC-O11 Dynamic, E-ATX', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Fractal Design Meshify 2', 9999, 'Корпус Fractal Design Meshify 2, ATX', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('NZXT H7 Elite', 11999, 'Корпус NZXT H7 Elite, ATX', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Corsair 5000D Airflow', 10999, 'Корпус Corsair 5000D Airflow, ATX', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7');

-- Вставка оперативной памяти
INSERT INTO rams (name, price, description, image_url) VALUES
('G.Skill Trident Z5 RGB 32GB', 12999, 'Оперативная память G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6000', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Corsair Dominator Platinum RGB 32GB', 11999, 'Оперативная память Corsair Dominator Platinum RGB 32GB (2x16GB) DDR5-5600', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Kingston Fury Renegade 32GB', 10999, 'Оперативная память Kingston Fury Renegade 32GB (2x16GB) DDR5-6000', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Crucial Ballistix 32GB', 9999, 'Оперативная память Crucial Ballistix 32GB (2x16GB) DDR4-3600', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7');

-- Вставка блоков питания
INSERT INTO power_units (name, price, description, image_url) VALUES
('Corsair HX1500i', 24999, 'Блок питания Corsair HX1500i, 1500W, 80+ Platinum', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Seasonic PRIME TX-1300', 22999, 'Блок питания Seasonic PRIME TX-1300, 1300W, 80+ Titanium', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('be quiet! Dark Power 12 1200W', 19999, 'Блок питания be quiet! Dark Power 12 1200W, 80+ Titanium', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('EVGA SuperNOVA 1600 T2', 21999, 'Блок питания EVGA SuperNOVA 1600 T2, 1600W, 80+ Titanium', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7');

-- Вставка HDD
INSERT INTO hdds (name, price, description, image_url) VALUES
('Seagate IronWolf Pro 16TB', 29999, 'Жесткий диск Seagate IronWolf Pro 16TB, 7200 RPM', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Western Digital Red Pro 14TB', 27999, 'Жесткий диск Western Digital Red Pro 14TB, 7200 RPM', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Toshiba N300 12TB', 24999, 'Жесткий диск Toshiba N300 12TB, 7200 RPM', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Seagate BarraCuda Pro 10TB', 19999, 'Жесткий диск Seagate BarraCuda Pro 10TB, 7200 RPM', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7');

-- Вставка SSD
INSERT INTO ssds (name, price, description, image_url) VALUES
('Samsung 990 PRO 2TB', 19999, 'SSD Samsung 990 PRO 2TB, NVMe PCIe 4.0', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('WD Black SN850X 2TB', 17999, 'SSD WD Black SN850X 2TB, NVMe PCIe 4.0', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Seagate FireCuda 530 2TB', 16999, 'SSD Seagate FireCuda 530 2TB, NVMe PCIe 4.0', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Crucial T700 2TB', 18999, 'SSD Crucial T700 2TB, NVMe PCIe 5.0', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7');

-- Вставка готовых сборок
INSERT INTO builds (name, description, total_price, cpu_id, gpu_id, motherboard_id, body_id, ram_id, power_unit_id, hdd_id, ssd_id, image_url) VALUES
('Игровая сборка премиум', 'Мощная игровая сборка для требовательных игр', 349999, 1, 1, 1, 1, 1, 1, 1, 1, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Игровая сборка среднего уровня', 'Отличная сборка для комфортного гейминга', 249999, 3, 3, 3, 3, 3, 3, 3, 3, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Рабочая станция', 'Производительная сборка для работы', 299999, 2, 2, 2, 2, 2, 2, 2, 2, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'),
('Бюджетная сборка', 'Доступная сборка для повседневных задач', 149999, 4, 4, 4, 4, 4, 4, 4, 4, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'); 