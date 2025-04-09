-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    passwordhash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user'
);

-- Создание таблицы процессоров
CREATE TABLE IF NOT EXISTS cpu (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    cores VARCHAR(50) NOT NULL,
    threads VARCHAR(50) NOT NULL,
    socket VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Создание таблицы видеокарт
CREATE TABLE IF NOT EXISTS gpu (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    vram INTEGER NOT NULL,
    memory_type VARCHAR(50) NOT NULL,
    gpu_clock DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    release_date DATE
);

-- Создание таблицы материнских плат
CREATE TABLE IF NOT EXISTS motherboard (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    socket VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Создание таблицы корпусов
CREATE TABLE IF NOT EXISTS body (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Создание таблицы оперативной памяти
CREATE TABLE IF NOT EXISTS ram (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity VARCHAR(50) NOT NULL,
    ddr VARCHAR(20) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Создание таблицы блоков питания
CREATE TABLE IF NOT EXISTS power_unit (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    wattage VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Создание таблицы HDD
CREATE TABLE IF NOT EXISTS hdd (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    capacity VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Создание таблицы SSD
CREATE TABLE IF NOT EXISTS ssd (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    capacity VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Создание таблицы сборок
CREATE TABLE IF NOT EXISTS pcbuild (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cpu_id INTEGER REFERENCES cpu(id),
    gpu_id INTEGER REFERENCES gpu(id),
    motherboard_id INTEGER REFERENCES motherboard(id),
    body_id INTEGER REFERENCES body(id),
    ram_id INTEGER REFERENCES ram(id),
    power_unit_id INTEGER REFERENCES power_unit(id),
    hdd_id INTEGER REFERENCES hdd(id),
    ssd_id INTEGER REFERENCES ssd(id),
    total_price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255)
);

-- Создание таблицы заказов
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL
);

-- Создание таблицы элементов заказа
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    pcbuild_id INTEGER REFERENCES pcbuild(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Создание таблицы корзины
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    pcbuild_id INTEGER REFERENCES pcbuild(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание администратора по умолчанию
INSERT INTO users (name, surname, phone, email, passwordhash, role)
VALUES ('Admin', 'Admin', '+79999999999', 'admin@example.com', '$2a$10$YourHashedPasswordHere', 'admin')
ON CONFLICT (email) DO NOTHING; 