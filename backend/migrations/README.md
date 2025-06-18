# Миграции базы данных

## Описание

Этот каталог содержит SQL миграции для настройки и обновления структуры базы данных.

## Новые миграции (000013-000015)

### 000013_fix_orders_table.up.sql
Добавляет недостающие поля в таблицу `orders`:
- `shipping_address` - адрес доставки
- `payment_method` - способ оплаты  
- `delivery_method` - способ доставки
- `comment` - комментарий к заказу
- `created_at`, `updated_at`, `deleted_at` - поля GORM

### 000013_fix_order_items_table.up.sql
Добавляет недостающие поля в таблицу `order_items`:
- `created_at`, `updated_at`, `deleted_at` - поля GORM
- Убеждается, что все обязательные поля существуют

### 000014_add_quantity_to_cart_items.up.sql
Добавляет поле `quantity` в таблицу `cart_items`:
- `quantity` - количество товара в корзине

### 000015_fix_order_items_simple.up.sql
Упрощает таблицу `order_items`, убирая поля GORM:
- Удаляет `created_at`, `updated_at`, `deleted_at`
- Оставляет только необходимые поля: `id`, `order_id`, `pcbuild_id`, `quantity`, `price`
- Создает индексы для улучшения производительности

## Применение миграций

Миграции применяются автоматически при запуске приложения в `main.go`.

### Ручное применение

Если нужно применить миграции вручную:

```bash
# Подключитесь к базе данных
psql -h localhost -U username -d database_name

# Примените миграции
\i migrations/000013_fix_orders_table.up.sql
\i migrations/000013_fix_order_items_table.up.sql
```

### Проверка структуры

После применения миграций выполните:

```bash
psql -h localhost -U username -d database_name -f migrations/check_tables.sql
```

## Откат миграций

Для отката изменений используйте down-миграции:

```bash
psql -h localhost -U username -d database_name -f migrations/000013_fix_orders_table.down.sql
psql -h localhost -U username -d database_name -f migrations/000013_fix_order_items_table.down.sql
```

## Структура таблиц после миграции

### Таблица orders
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    delivery_method VARCHAR(50) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);
```

### Таблица order_items
```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    pcbuild_id INTEGER NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL DEFAULT 0
);
``` 