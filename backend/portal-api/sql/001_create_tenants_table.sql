CREATE TABLE IF NOT EXISTS tenants (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       UUID NOT NULL UNIQUE,          -- used for subdomain + Redis key
    store_name      VARCHAR(255) NOT NULL,
    admin_name      VARCHAR(255) NOT NULL,
    admin_mail      VARCHAR(255) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'live', 'failed', 'suspended')),
    store_url       VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants (status);
