# 1

Надо ли сделать процедуру/функцию, чтобы при добавлении записи в cart_items, в cart по cart_id сразу редактировалось поле updated_at?

```pgsql
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT REFERENCES cart(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price_cents INT NOT NULL
);
```

# 2

Надо ли сделать процедуру/функцию, чтобы при добавлении записи в order_items или изменении quantity по order_id сразу редактировалось поле updated_at? Насколько вообще нормальная практика, что сначала нам нужно создать order, чтобы добавлять по его id в него товары. И при первом заполнении на добавлении каждого товара будет меняться updated_at в orders?

```pgsql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    user_address_id INT REFERENCES user_addresses(id),
    order_status_id INT REFERENCES order_statuses(id),
    address TEXT,
    subtotal_cents INT,
    shipping_cents INT,
    discount_cents INT,
    total_cents INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. ВСЁ, ЧТО ЗАВИСИТ ОТ ORDERS

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    product_name_snapshot TEXT,
    unit_price_cents_snapshot INT,
    quantity INT,
    line_total_cents INT
);
```

# 3

sql для разбора:

```pgsql
CREATE TABLE order_statuses (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    user_address_id INT REFERENCES user_addresses(id),
    order_status_id INT REFERENCES order_statuses(id),
    address TEXT,
    subtotal_cents INT,
    shipping_cents INT,
    discount_cents INT,
    total_cents INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_status_history (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    changed_by_user INT REFERENCES users(id),
    old_status TEXT,
    new_status TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    note TEXT
);
```

## 3.1.

order_status_history:
old_status TEXT,
new_status TEXT,

Должен ли я в этих полях брать статусы из order_statuses, по типу:
	old_status TEXT REFERENCES order_statuses(id) ON DELETE CASCADE

## 3.2.

Надо ли иметь процедуру/функцию, которая при добавлении статуса, меняла бы order_status_id?
Как будто-бы связка этих трёх таблиц неверная. И должно быть что-то в таком духе (или пересматривать отношения этих таблиц):

```pgsql
CREATE TABLE order_statuses (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    user_address_id INT REFERENCES user_addresses(id),
--
    order_status_id INT REFERENCES order_statuses(id),
--
    address TEXT,
    subtotal_cents INT,
    shipping_cents INT,
    discount_cents INT,
    total_cents INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_status_history (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    changed_by_user INT REFERENCES users(id),
--
    old_status INT REFERENCES order_statuses(id),
    new_status INT REFERENCES order_statuses(id),
--
    created_at TIMESTAMP DEFAULT NOW(),
    note TEXT
);
```

Ведь тогда получается, что order_status_history должен брать статусы из order_statuses(id), а orders должен тогда что брать... Вероятно, new_status из последней (по времени) для этого заказа записи. А у себя иметь поле, ссылающееся на order_statuses(id) - то есть и new_status, и old_status, и order_status_id будут имять связь с таблицей order_statuses(id) (может, это и не криминально).

## 3.3.

Надо ли тогда при смене статуса в orders менять его updated_at (логически вообще надо ли это считать как обновление заказа или тут мы его не меняем, а просто переписываем текущий статус).

# 4.

Рассматриваемый код:

```pgsql
CREATE TABLE shipment_statuses (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    shipment_status_id INT REFERENCES shipment_statuses(id),
    carrier TEXT,
    tracking_number TEXT,
    label_url TEXT,
    shipping_cost_cents INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shipment_events (
    id SERIAL PRIMARY KEY,
    shipment_id INT REFERENCES shipments(id) ON DELETE CASCADE,
    status_before TEXT,
    status_new TEXT,
    description TEXT,
    event_time TIMESTAMP,
    raw_payload TEXT
);
```

## 4.1.

Не должно ли у нас в shipments и shipment_events в статусах везде быть `INT REFERENCES shipment_statuses(id)`?

## 4.2.

При обновлении статуса, должен ли у нас меняться updated_at в shipmets - нужна ли для этого функция/процедура? И как обнавляется статус - также по последнему по времени для этого shipment_id status_new?

# 5. 

Вытекает из пунктов 3 и 4 - нужны ли нам вообщеshipment status_id и order_status_id, если при необходимости мы можем написать запрос, который бы подтягивал последний (т.е. текущий) для этого заказа/доставки статус. Мы ведь всё равно получаем его таким способом, зачем приписывать каждый раз при обновлении статуса, мы ведь его и так уже отражаем, только в другой таблице. Не лучше ли тогда подтягивать при необходимости?
