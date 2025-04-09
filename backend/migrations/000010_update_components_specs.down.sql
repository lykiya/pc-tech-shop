-- Возвращаем исходные характеристики блока питания
UPDATE products 
SET specs = specs::jsonb - 'Мощность'
WHERE category = 'psu' AND name = 'Corsair RM850x';

-- Возвращаем форм-фактор корпуса
UPDATE products 
SET specs = jsonb_set(
    specs::jsonb,
    '{Форм-фактор}',
    'null'::jsonb
)
WHERE category = 'case' AND name = 'NZXT H510'; 