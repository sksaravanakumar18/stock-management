-- Stock Transaction Tables
CREATE TABLE IF NOT EXISTS stock_transaction (
    id UUID PRIMARY KEY,
    reference_number VARCHAR(50) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    vendor_id UUID,
    customer_id UUID,
    notes VARCHAR(500),
    transaction_date TIMESTAMP NOT NULL,
    total_amount DECIMAL(19, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS transaction_line_item (
    id UUID PRIMARY KEY,
    transaction_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity DECIMAL(19, 2) NOT NULL,
    unit_price DECIMAL(19, 2) NOT NULL,
    discount DECIMAL(19, 2),
    line_total DECIMAL(19, 2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES stock_transaction(id)
);

CREATE TABLE IF NOT EXISTS stock_ledger (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL,
    movement_type VARCHAR(10) NOT NULL,
    quantity DECIMAL(19, 2) NOT NULL,
    running_balance DECIMAL(19, 2) NOT NULL,
    transaction_id UUID,
    movement_date TIMESTAMP NOT NULL,
    remarks VARCHAR(500),
    FOREIGN KEY (transaction_id) REFERENCES stock_transaction(id)
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID,
    before_values TEXT,
    after_values TEXT,
    timestamp TIMESTAMP NOT NULL,
    description VARCHAR(500)
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_transaction_type ON stock_transaction(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transaction_date ON stock_transaction(transaction_date);
CREATE INDEX IF NOT EXISTS idx_ledger_product ON stock_ledger(product_id);
CREATE INDEX IF NOT EXISTS idx_ledger_date ON stock_ledger(movement_date);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
