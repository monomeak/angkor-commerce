-- ─────────────────────────────────────────────────────────
-- Map-picked coordinates for a saved address
--
-- Nullable: an address typed by hand never gets any, and a rider
-- follows the written lines when they are missing.
-- NUMERIC(9,6) holds the full longitude range (±180) at ~11 cm
-- resolution — finer than a phone's GPS fix, and exact, unlike a
-- float, so a pin never drifts on a round trip.
-- ─────────────────────────────────────────────────────────

BEGIN;

ALTER TABLE customer_addresses
    ADD COLUMN latitude  NUMERIC(9, 6),
    ADD COLUMN longitude NUMERIC(9, 6);

ALTER TABLE customer_addresses
    ADD CONSTRAINT ck_customer_addresses_coordinates
        CHECK (
            (latitude IS NULL AND longitude IS NULL)
                OR (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
            );

COMMIT;
