INSERT INTO categories (id, parent_id, name, slug, sort_order)
VALUES
    (1, NULL, 'Men', 'men', 0),
    (2, NULL, 'Women', 'women', 0),
    (3, NULL, 'Children', 'children', 0),

    (4, 1, 'Shirt', 'men-shirt', 0),
    (5, 1, 'T-shirt', 'men-t-shirt', 10),
    (6, 1, 'Pants', 'men-pants', 20),
    (7, 1, 'Hats', 'men-hats', 30),
    (8, 1, 'Krama', 'men-krama', 40),
    (9, 1, 'Short-pants', 'men-short-pants', 50),
    (10, 1, 'Shoes', 'men-shoes', 60),

    (11, 2, 'Blouse', 'women-blouse', 0),
    (12, 2, 'Sampot (Skirt)', 'women-sampot', 10),
    (13, 2, 'Dress', 'women-dress', 20),
    (14, 2, 'Scarf (Krama)', 'women-scarf', 30),
    (15, 2, 'Accessories', 'women-accessories', 40),
    (16, 2, 'Shoes', 'women-shoes', 50),

    (17, 3, 'Shirt', 'children-shirt', 0),
    (18, 3, 'Pants', 'children-pants', 10),
    (19, 3, 'Dresses', 'children-dresses', 20),
    (20, 3, 'Krama', 'children-krama', 30),
    (21, 3, 'Shoes', 'children-shoes', 40),
    (22, 3, 'Accessories', 'children-accessories', 50);

SELECT setval(
    pg_get_serial_sequence('categories', 'id'),
    (SELECT MAX(id) FROM categories),
    true
);