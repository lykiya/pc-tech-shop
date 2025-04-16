-- Тестовые данные для таблицы процессоров
INSERT INTO cpu (name, manufacturer, cores, threads, socket, price) VALUES
('Intel Core i9-13900K', 'Intel', '24', '32', 'LGA 1700', 58999.99),
('AMD Ryzen 9 7950X', 'AMD', '16', '32', 'AM5', 54999.99),
('Intel Core i7-13700K', 'Intel', '16', '24', 'LGA 1700', 39999.99),
('AMD Ryzen 7 7800X3D', 'AMD', '8', '16', 'AM5', 34999.99);

-- Тестовые данные для таблицы видеокарт
INSERT INTO gpu (name, manufacturer, vram, memory_type, gpu_clock, price, release_date) VALUES
('NVIDIA GeForce RTX 4090', 'NVIDIA', 24, 'GDDR6X', 2235, 159999.99, '2022-10-12'),
('AMD Radeon RX 7900 XTX', 'AMD', 24, 'GDDR6', 2300, 99999.99, '2022-12-13'),
('NVIDIA GeForce RTX 4080', 'NVIDIA', 16, 'GDDR6X', 2205, 99999.99, '2022-11-16'),
('AMD Radeon RX 7900 XT', 'AMD', 20, 'GDDR6', 2000, 89999.99, '2022-12-13');

-- Тестовые данные для таблицы материнских плат
INSERT INTO motherboard (name, manufacturer, socket, price) VALUES
('ASUS ROG MAXIMUS Z790 HERO', 'ASUS', 'LGA 1700', 39999.99),
('GIGABYTE X670E AORUS MASTER', 'GIGABYTE', 'AM5', 34999.99),
('MSI MPG Z790 CARBON WIFI', 'MSI', 'LGA 1700', 29999.99),
('ASUS ROG STRIX X670E-E GAMING WIFI', 'ASUS', 'AM5', 29999.99);

-- Тестовые данные для таблицы корпусов
INSERT INTO body (name, manufacturer, price) VALUES
('Lian Li PC-O11 Dynamic', 'Lian Li', 12999.99),
('Fractal Design Meshify C', 'Fractal Design', 8999.99),
('NZXT H7 Flow', 'NZXT', 10999.99),
('Corsair 4000D Airflow', 'Corsair', 9999.99);

-- Тестовые данные для таблицы оперативной памяти
INSERT INTO ram (name, capacity, ddr, price) VALUES
('Corsair Dominator Platinum RGB', '32GB', 'DDR5', 15999.99),
('G.Skill Trident Z5 RGB', '32GB', 'DDR5', 14999.99),
('Kingston Fury Renegade', '32GB', 'DDR5', 12999.99),
('Crucial Ballistix', '32GB', 'DDR4', 8999.99);

-- Тестовые данные для таблицы блоков питания
INSERT INTO power_unit (name, wattage, price) VALUES
('Corsair HX1500i', '1500W', 24999.99),
('Seasonic PRIME TX-1300', '1300W', 22999.99),
('be quiet! Dark Power 12', '1200W', 19999.99),
('EVGA SuperNOVA 1000 G6', '1000W', 14999.99);

-- Тестовые данные для таблицы HDD
INSERT INTO hdd (name, manufacturer, capacity, price) VALUES
('Seagate IronWolf Pro', 'Seagate', '16TB', 29999.99),
('Western Digital Red Pro', 'WD', '14TB', 27999.99),
('Toshiba N300', 'Toshiba', '12TB', 23999.99),
('Seagate BarraCuda Pro', 'Seagate', '10TB', 19999.99);

-- Тестовые данные для таблицы SSD
INSERT INTO ssd (name, manufacturer, capacity, price) VALUES
('Samsung 990 PRO', 'Samsung', '2TB', 19999.99),
('WD Black SN850X', 'Western Digital', '2TB', 17999.99),
('Seagate FireCuda 530', 'Seagate', '2TB', 16999.99),
('Crucial T700', 'Crucial', '2TB', 15999.99);

-- Тестовые данные для таблицы сборок
INSERT INTO pcbuild (name, description, cpu_id, gpu_id, motherboard_id, body_id, ram_id, power_unit_id, hdd_id, ssd_id, total_price, image_url) VALUES
('Gaming Beast', 'Мощная игровая сборка для 4K гейминга', 1, 1, 1, 1, 1, 1, 1, 1, 349999.99, 'https://example.com/images/gaming-beast.jpg'),
('Content Creator', 'Идеальная сборка для работы с контентом', 2, 2, 2, 2, 2, 2, 2, 2, 299999.99, 'https://example.com/images/content-creator.jpg'),
('Budget Gaming', 'Отличная сборка для 1440p гейминга', 3, 3, 3, 3, 3, 3, 3, 3, 199999.99, 'https://example.com/images/budget-gaming.jpg'),
('Streaming PC', 'Оптимальная сборка для стриминга', 4, 4, 4, 4, 4, 4, 4, 4, 249999.99, 'https://example.com/images/streaming-pc.jpg');

-- Тестовые данные для таблицы пользователей
INSERT INTO users (name, surname, phone, email, passwordhash, role) VALUES
('Иван', 'Иванов', '+79991234567', 'ivan@example.com', '$2a$10$YourHashedPasswordHere', 'user'),
('Петр', 'Петров', '+79992345678', 'petr@example.com', '$2a$10$YourHashedPasswordHere', 'user'),
('Анна', 'Сидорова', '+79993456789', 'anna@example.com', '$2a$10$YourHashedPasswordHere', 'user'),
('Мария', 'Козлова', '+79994567890', 'maria@example.com', '$2a$10$YourHashedPasswordHere', 'user');

-- Тестовые данные для таблицы заказов
INSERT INTO orders (user_id, total_price, status, shipping_address, payment_method) VALUES
(1, 349999.99, 'completed', 'г. Москва, ул. Ленина, д. 1, кв. 1', 'card'),
(2, 299999.99, 'processing', 'г. Санкт-Петербург, ул. Пушкина, д. 2, кв. 2', 'card'),
(3, 199999.99, 'new', 'г. Екатеринбург, ул. Гагарина, д. 3, кв. 3', 'cash'),
(4, 249999.99, 'shipped', 'г. Новосибирск, ул. Мира, д. 4, кв. 4', 'card');

-- Тестовые данные для таблицы элементов заказа
INSERT INTO order_items (order_id, pcbuild_id, quantity, price) VALUES
(1, 1, 1, 349999.99),
(2, 2, 1, 299999.99),
(3, 3, 1, 199999.99),
(4, 4, 1, 249999.99);

-- Тестовые данные для таблицы корзины
INSERT INTO cart_items (user_id, pcbuild_id) VALUES
(1, 2),
(2, 3),
(3, 4),
(4, 1); 