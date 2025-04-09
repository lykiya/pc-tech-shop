-- Удаляем старую таблицу
DROP TABLE IF EXISTS cart_items;

-- Создаем новую таблицу с обновленной структурой
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    pcbuild_id INTEGER REFERENCES pcbuild(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 