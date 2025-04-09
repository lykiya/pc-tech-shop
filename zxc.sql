CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	surname VARCHAR(100) NOT NULL,
	phone VARCHAR(20) UNIQUE NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	passwordHash VARCHAR(200) NOT NULL
);

CREATE TABLE CPU (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    cores VARCHAR(20) NOT NULL,
    threads VARCHAR(100) NOT NULL,
    socket VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    release_date DATE
);

CREATE TABLE GPU (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    vram INTEGER NOT NULL,  -- Количество видеопамяти в ГБ
    memory_type VARCHAR(100) NOT NULL,
    gpu_clock DECIMAL(10,2) NOT NULL,  -- Частота ядра в МГц
    price DECIMAL(10,2) NOT NULL,
    release_date DATE
);

CREATE TABLE Motherboard (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
	socket VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE Body (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE RAM (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
	capacity VARCHAR(100) NOT NULL,
	ddr VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE PowerUnit (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
	wattage VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE HDD(
	id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
	capacity VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE SSD(
	id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
	capacity VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE PCBuild (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(1000),
    cpu_id INTEGER REFERENCES CPU(id),
    gpu_id INTEGER REFERENCES GPU(id),
    motherboard_id INTEGER REFERENCES Motherboard(id),
    body_id INTEGER REFERENCES Body(id),
    ram_id INTEGER REFERENCES RAM(id),
    power_unit_id INTEGER REFERENCES PowerUnit(id),
    hdd_id INTEGER REFERENCES HDD(id),
    ssd_id INTEGER REFERENCES SSD(id),
    total_price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255)
);

CREATE TABLE user_backet(
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id),
	pcbuild_id INTEGER REFERENCES PCBuild(id)
);

CREATE TABLE Orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id),  -- Ссылка на таблицу пользователей
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,  -- Статус заказа (например, "В обработке", "Отправлено", "Доставлено")
    shipping_address VARCHAR(255) NOT NULL,  -- Адрес доставки
    payment_method VARCHAR(50) NOT NULL  -- Способ оплаты (например, "Кредитная карта", "Платежная система")
);


-- заполняем --


INSERT INTO CPU (name, manufacturer, cores, threads, socket, price, release_date) VALUES
('Intel Core i9-13900K', 'Intel', '24', '32', 'LGA 1700', 749.99, '2022-10-20'),
('Intel Core i7-13700K', 'Intel', '16', '24', 'LGA 1700', 549.99, '2022-10-20'),
('Intel Core i5-13600K', 'Intel', '14', '20', 'LGA 1700', 319.99, '2022-10-20'),
('AMD Ryzen 9 7950X', 'AMD', '16', '32', 'AM5', 799.99, '2022-09-27'),
('AMD Ryzen 7 7700X', 'AMD', '8', '16', 'AM5', 399.99, '2022-09-27'),
('AMD Ryzen 5 7600X', 'AMD', '6', '12', 'AM5', 299.99, '2022-09-27'),
('Intel Core i9-12900K', 'Intel', '16', '24', 'LGA 1700', 629.99, '2021-11-04'),
('Intel Core i7-12700K', 'Intel', '12', '20', 'LGA 1700', 409.99, '2021-11-04'),
('Intel Core i5-12600K', 'Intel', '10', '16', 'LGA 1700', 269.99, '2021-11-04'),
('AMD Ryzen 9 5900X', 'AMD', '12', '24', 'AM4', 549.99, '2020-11-05'),
('AMD Ryzen 7 5800X', 'AMD', '8', '16', 'AM4', 449.99, '2020-11-05'),
('AMD Ryzen 5 5600X', 'AMD', '6', '12', 'AM4', 299.99, '2020-11-05'),
('Intel Core i9-11900K', 'Intel', '8', '16', 'LGA 1200', 499.99, '2021-03-30'),
('Intel Core i7-11700K', 'Intel', '8', '16', 'LGA 1200', 399.99, '2021-03-30'),
('Intel Core i5-11600K', 'Intel', '6', '12', 'LGA 1200', 269.99, '2021-03-30'),
('AMD Ryzen 9 3950X', 'AMD', '16', '32', 'AM4', 749.99, '2019-11-25'),
('AMD Ryzen 7 3700X', 'AMD', '8', '16', 'AM4', 329.99, '2019-07-07'),
('AMD Ryzen 5 3600X', 'AMD', '6', '12', 'AM4', 249.99, '2019-07-07'),
('Intel Core i9-10900K', 'Intel', '10', '20', 'LGA 1200', 499.99, '2020-05-20'),
('Intel Core i7-10700K', 'Intel', '8', '16', 'LGA 1200', 379.99, '2020-05-20'),
('Intel Core i5-10600K', 'Intel', '6', '12', 'LGA 1200', 262.99, '2020-05-20'),
('AMD Ryzen 9 3900X', 'AMD', '12', '24', 'AM4', 499.99, '2019-07-07'),
('AMD Ryzen 7 3800X', 'AMD', '8', '16', 'AM4', 399.99, '2019-07-07'),
('Intel Core i9-10850K', 'Intel', '10', '20', 'LGA 1200', 499.99, '2020-05-20'),
('Intel Core i7-10700', 'Intel', '8', '16', 'LGA 1200', 319.99, '2020-05-20');


INSERT INTO GPU (name, manufacturer, vram, memory_type, gpu_clock, price, release_date) VALUES
('NVIDIA GeForce RTX 4090', 'NVIDIA', 24, 'GDDR6X', 2520.00, 1599.99, '2022-10-12'),
('NVIDIA GeForce RTX 4080', 'NVIDIA', 16, 'GDDR6X', 2205.00, 1199.99, '2022-11-16'),
('NVIDIA GeForce RTX 4070 Ti', 'NVIDIA', 12, 'GDDR6X', 2610.00, 799.99, '2023-01-05'),
('NVIDIA GeForce RTX 3070 Ti', 'NVIDIA', 8, 'GDDR6X', 1770.00, 599.99, '2021-06-10'),
('NVIDIA GeForce RTX 3060 Ti', 'NVIDIA', 8, 'GDDR6', 1770.00, 399.99, '2020-12-02'),
('NVIDIA GeForce RTX 3060', 'NVIDIA', 12, 'GDDR6', 1780.00, 329.99, '2021-02-25'),
('AMD Radeon RX 7900 XTX', 'AMD', 24, 'GDDR6', 2500.00, 999.99, '2022-12-13'),
('AMD Radeon RX 7900 XT', 'AMD', 20, 'GDDR6', 2300.00, 899.99, '2022-12-13'),
('AMD Radeon RX 7800 XT', 'AMD', 16, 'GDDR6', 2100.00, 649.99, '2023-09-06'),
('AMD Radeon RX 7700 XT', 'AMD', 12, 'GDDR6', 2200.00, 499.99, '2023-09-06'),
('AMD Radeon RX 6800 XT', 'AMD', 16, 'GDDR6', 2250.00, 649.99, '2020-11-18'),
('AMD Radeon RX 6800', 'AMD', 16, 'GDDR6', 2100.00, 579.99, '2020-11-18'),
('AMD Radeon RX 6700 XT', 'AMD', 12, 'GDDR6', 2420.00, 479.99, '2021-03-18'),
('NVIDIA GeForce RTX 2080 Ti', 'NVIDIA', 11, 'GDDR6', 1545.00, 999.99, '2018-09-20'),
('NVIDIA GeForce RTX 2080 Super', 'NVIDIA', 8, 'GDDR6', 1650.00, 699.99, '2019-07-23'),
('NVIDIA GeForce GTX 1660 Ti', 'NVIDIA', 6, 'GDDR6', 1770.00, 279.99, '2019-02-22'),
('NVIDIA GeForce GTX 1660 Super', 'NVIDIA', 6, 'GDDR5', 1530.00, 229.99, '2019-10-29'),
('NVIDIA GeForce GTX 1650 Super', 'NVIDIA', 4, 'GDDR5', 1530.00, 159.99, '2019-11-22'),
('AMD Radeon RX 5600 XT', 'AMD', 6, 'GDDR6', 1750.00, 279.99, '2020-01-21'),
('AMD Radeon RX 5500 XT', 'AMD', 4, 'GDDR6', 1670.00, 169.99, '2019-12-12');


INSERT INTO Motherboard (name, manufacturer, socket, price) VALUES
('ASUS ROG Strix Z790-E', 'ASUS', 'LGA 1700', 399.99),
('MSI MPG Z690 Carbon WiFi', 'MSI', 'LGA 1700', 299.99),
('Gigabyte Z690 AORUS Master', 'Gigabyte', 'LGA 1700', 399.99),
('ASRock B550 Steel Legend', 'ASRock', 'AM4', 149.99),
('ASUS TUF Gaming B550-PLUS', 'ASUS', 'AM4', 139.99),
('MSI MAG B550 TOMAHAWK WIFI', 'MSI', 'AM4', 169.99),
('Gigabyte B450 AORUS Pro', 'Gigabyte', 'AM4', 109.99),
('ASRock Z590 Phantom Gaming 4', 'ASRock', 'LGA 1200', 179.99),
('ASUS Prime Z590-A', 'ASUS', 'LGA 1200', 219.99),
('MSI MAG B460 TOMAHAWK WIFI', 'MSI', 'LGA 1200', 129.99),
('Gigabyte B550M AORUS PRO', 'Gigabyte', 'AM4', 119.99),
('ASUS ROG Crosshair VIII Hero', 'ASUS', 'AM4', 379.99),
('MSI MEG X570 UNIFY', 'MSI', 'AM4', 249.99),
('ASRock Z490 Taichi', 'ASRock', 'LGA 1200', 249.99),
('ASUS TUF Gaming X570-PLUS', 'ASUS', 'AM4', 189.99),
('Gigabyte AORUS X570 Master', 'Gigabyte', 'AM4', 329.99),
('MSI B450M Mortar MAX', 'MSI', 'AM4', 99.99),
('ASRock B450M Pro4', 'ASRock', 'AM4', 79.99),
('Gigabyte Z590 AORUS ELITE', 'Gigabyte', 'LGA 1200', 179.99),
('ASUS ROG Strix X570-E', 'ASUS', 'AM4', 249.99);

INSERT INTO Body (name, price) VALUES
('NZXT H510', 69.99),
('Corsair iCUE 4000X RGB', 99.99),
('Fractal Design Meshify C', 89.99),
('Phanteks Eclipse P400A', 79.99),
('Cooler Master MasterBox Q300L', 59.99),
('Lian Li PC-O11 Dynamic', 139.99),
('Thermaltake V200', 59.99),
('be quiet! Pure Base 500DX', 99.99),
('Corsair 5000D Airflow', 109.99),
('Cooler Master H500', 99.99),
('NZXT H510 Elite', 149.99),
('Fractal Design Define R6', 139.99),
('MSI MAG VAMPIRIC 100R', 69.99),
('Phanteks P360A', 89.99),
('Thermaltake Core P3', 129.99),
('Cooler Master MasterBox MB320L', 69.99),
('Corsair 275R Airflow', 79.99),
('Lian Li PC-011 Air', 129.99),
('NZXT H710', 169.99),
('Thermaltake S500', 99.99);

INSERT INTO RAM (name, capacity, ddr, price) VALUES
('Corsair Vengeance LPX 16GB', '16GB', 'DDR4', 74.99),
('G.SKILL Ripjaws V 16GB', '16GB', 'DDR4', 69.99),
('Kingston HyperX Fury 16GB', '16GB', 'DDR4', 64.99),
('Crucial Ballistix 16GB', '16GB', 'DDR4', 69.99),
('Corsair Vengeance RGB Pro 32GB', '32GB', 'DDR4', 149.99),
('G.SKILL Trident Z RGB 32GB', '32GB', 'DDR4', 169.99),
('Kingston HyperX Predator 32GB', '32GB', 'DDR4', 179.99),
('Crucial Ballistix 32GB', '32GB', 'DDR4', 139.99),
('Corsair Dominator Platinum 16GB', '16GB', 'DDR4', 129.99),
('G.SKILL Ripjaws V 8GB', '8GB', 'DDR4', 39.99),
('Kingston Fury Beast 8GB', '8GB', 'DDR4', 39.99),
('Corsair Vengeance LPX 8GB', '8GB', 'DDR4', 34.99),
('Crucial Ballistix 8GB', '8GB', 'DDR4', 34.99),
('ADATA XPG Gammix D30 16GB', '16GB', 'DDR4', 59.99),
('Team T-Force Delta RGB 16GB', '16GB', 'DDR4', 69.99),
('Corsair Vengeance LPX 64GB', '64GB', 'DDR4', 279.99),
('G.SKILL Ripjaws V 64GB', '64GB', 'DDR4', 289.99),
('Patriot Viper Steel 16GB', '16GB', 'DDR4', 79.99),
('Kingston HyperX Fury 8GB', '8GB', 'DDR4', 34.99),
('Crucial Ballistix Tactical 16GB', '16GB', 'DDR4', 84.99);

INSERT INTO PowerUnit (name, wattage, price) VALUES
('Corsair RM850x', '850W', 129.99),
('EVGA SuperNOVA 750 G5', '750W', 109.99),
('Seasonic Focus GX-750', '750W', 119.99),
('Cooler Master MWE Gold 850W', '850W', 109.99),
('be quiet! Straight Power 11 850W', '850W', 149.99),
('Thermaltake Toughpower GF1 850W', '850W', 129.99),
('ASUS ROG Strix 750W', '750W', 119.99),
('FSP Hydro G 650W', '650W', 69.99),
('SilverStone Technology Strider 700W', '700W', 79.99),
('Corsair CV650', '650W', 54.99),
('MSI MAG A650BN', '650W', 79.99),
('Gigabyte P750GM', '750W', 89.99),
('Cooler Master V850', '850W', 149.99),
('Corsair HX1200', '1200W', 249.99),
('Seasonic FOCUS PX-850', '850W', 139.99),
('EVGA 600 W1', '600W', 39.99),
('Zalman ZM700-LE', '700W', 59.99),
('Thermaltake Smart 500W', '500W', 39.99),
('Antec EarthWatts Gold Pro 650W', '650W', 89.99),
('SilverStone ST75F-GS 750W', '750W', 129.99);



INSERT INTO HDD (name, capacity, price) VALUES
('Seagate Barracuda 1TB', '1TB', 49.99),
('Western Digital Blue 1TB', '1TB', 44.99),
('Toshiba P300 1TB', '1TB', 39.99),
('Seagate Barracuda 2TB', '2TB', 69.99),
('Western Digital Blue 2TB', '2TB', 59.99),
('Toshiba P300 2TB', '2TB', 54.99),
('Seagate IronWolf 4TB', '4TB', 119.99),
('Western Digital Red 4TB', '4TB', 119.99),
('Seagate Barracuda 3TB', '3TB', 89.99),
('Western Digital Blue 3TB', '3TB', 79.99),
('Toshiba X300 4TB', '4TB', 129.99),
('Seagate Barracuda 5TB', '5TB', 139.99),
('Western Digital Black 6TB', '6TB', 169.99),
('Seagate Exos 10TB', '10TB', 239.99),
('Western Digital Red 6TB', '6TB', 159.99),
('Seagate IronWolf 8TB', '8TB', 189.99),
('Toshiba N300 8TB', '8TB', 179.99),
('Seagate Exos 12TB', '12TB', 349.99),
('Western Digital Red Pro 10TB', '10TB', 299.99),
('Seagate BarraCuda Pro 12TB', '12TB', 359.99);

INSERT INTO SSD (name, capacity, price) VALUES
('Samsung 970 EVO Plus 500GB', '500GB', 79.99),
('Crucial MX500 500GB', '500GB', 59.99),
('Western Digital Blue SN550 500GB', '500GB', 49.99),
('Kingston A2000 500GB', '500GB', 49.99),
('Seagate Barracuda 500GB', '500GB', 49.99),
('Samsung 970 EVO Plus 1TB', '1TB', 129.99),
('Crucial MX500 1TB', '1TB', 99.99),
('Western Digital Blue SN570 1TB', '1TB', 79.99),
('Kingston A2000 1TB', '1TB', 74.99),
('Seagate FireCuda 1TB', '1TB', 99.99),
('Samsung 980 PRO 1TB', '1TB', 169.99),
('Western Digital Black SN850 1TB', '1TB', 179.99),
('Corsair MP600 1TB', '1TB', 159.99),
('Crucial P5 Plus 1TB', '1TB', 129.99),
('ADATA XPG SX8200 Pro 1TB', '1TB', 139.99),
('Samsung 980 2TB', '2TB', 229.99),
('Crucial P5 2TB', '2TB', 189.99),
('Western Digital Black SN850X 2TB', '2TB', 329.99),
('Seagate FireCuda 520 1TB', '1TB', 159.99),
('Corsair Force MP600 2TB', '2TB', 349.99);

INSERT INTO PCBuild (name, description, cpu_id, gpu_id, motherboard_id, body_id, ram_id, power_unit_id, hdd_id, ssd_id, total_price) VALUES
('Gaming Beast', 'A high-end gaming PC for 4K gaming with RTX 4080 and Ryzen 9 7900X', 1, 1, 1, 1, 1, 1, 1, 1, 4999.99),
('Workstation Pro', 'A powerful workstation for professional video editing and 3D rendering', 2, 3, 4, 2, 4, 2, 5, 5, 2999.99),
('Budget Gamer', 'An affordable gaming PC for 1080p gaming with Ryzen 5 5600X and RTX 3060', 3, 7, 6, 3, 6, 3, 6, 6, 1199.99),
('Multimedia PC', 'A balanced build for multimedia tasks, office work, and casual gaming', 4, 9, 8, 4, 7, 4, 7, 7, 1599.99),
('Storage Monster', 'A PC build with large storage capacity for media professionals and content creators', 5, 10, 7, 5, 8, 5, 8, 8, 2299.99);

