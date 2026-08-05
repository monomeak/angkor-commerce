BEGIN;
CREATE TABLE customer_addresses (
    id              BIGSERIAL PRIMARY KEY,
    customer_id     BIGINT       NOT NULL REFERENCES customers (id) ON DELETE RESTRICT,

    label           VARCHAR(50),                 -- "Home", "Office"
    recipient_name  VARCHAR(150) NOT NULL,
    recipient_phone VARCHAR(30)  NOT NULL,

    line1           VARCHAR(255) NOT NULL,       -- house no. + street
    line2           VARCHAR(255),                -- building, floor, landmark
    commune         VARCHAR(100),                -- sangkat / khum
    district        VARCHAR(100) NOT NULL,       -- khan / srok
    province        VARCHAR(100) NOT NULL,       -- capital / khaet
    postal_code     VARCHAR(20),
    country         VARCHAR(2)   NOT NULL DEFAULT 'KH',

    is_default      BOOLEAN      NOT NULL DEFAULT FALSE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',

    created_at      TIMESTAMPTZ  NOT NULL DEFAULT  CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT  CURRENT_TIMESTAMP,

    CONSTRAINT ck_customer_addresses_status
        CHECK (status IN ('ACTIVE', 'DELETED'))
);

CREATE INDEX idx_customer_addresses_customer
    ON customer_addresses (customer_id)
    WHERE status <> 'DELETED';

-- One default per customer, enforced by the database
CREATE UNIQUE INDEX uq_customer_addresses_default
    ON customer_addresses (customer_id)
    WHERE is_default = TRUE AND status <> 'DELETED';

CREATE TRIGGER trg_customer_addresses_updated_at
    BEFORE UPDATE ON customer_addresses
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMIT;