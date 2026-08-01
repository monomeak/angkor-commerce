-- V3: Add created_by/updated_by audit columns to customers and categories,
-- matching BaseEntity (already present on users via V1; these two were missing them).

BEGIN;

ALTER TABLE customers
    ADD COLUMN created_by BIGINT,
    ADD COLUMN updated_by BIGINT;

ALTER TABLE categories
    ADD COLUMN created_by BIGINT,
    ADD COLUMN updated_by BIGINT;

COMMIT;
