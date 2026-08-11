-- Separate from the tenants table on purpose — sensitive credentials
-- shouldn't share a row/table with anything read on common paths.
CREATE TABLE IF NOT EXISTS payment_credentials (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID NOT NULL,
    provider        VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'razorpay')),
    encrypted_key   TEXT NOT NULL,   -- AES-256-GCM ciphertext, see utils/encryption.js
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_payment_credentials_tenant ON payment_credentials (tenant_id);
