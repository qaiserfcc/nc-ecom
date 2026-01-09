-- Quotes table + realtime NOTIFY trigger

CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_progress', 'resolved')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);

CREATE OR REPLACE FUNCTION notify_quote_submitted()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'quote_submitted',
    json_build_object(
      'quoteId', NEW.id,
      'userId', NEW.user_id,
      'name', NEW.name,
      'email', NEW.email,
      'phone', NEW.phone,
      'message', NEW.message,
      'createdAt', NEW.created_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_quote_submitted') THEN
    CREATE TRIGGER trg_quote_submitted
    AFTER INSERT ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION notify_quote_submitted();
  END IF;
END $$;
