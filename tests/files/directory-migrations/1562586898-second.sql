ALTER TABLE transactions ADD COLUMN (
  isBotTransaction boolean DEFAULT 0
);
