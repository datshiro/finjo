CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  amount_dong BIGINT NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'VND',
  category VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  merchant TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source VARCHAR(10) NOT NULL DEFAULT 'text',
  raw_input TEXT NOT NULL,
  telegram_message_id BIGINT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
