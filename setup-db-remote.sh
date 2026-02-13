#!/bin/bash
set -e
sudo -u postgres psql <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'suteki') THEN
    CREATE USER suteki WITH PASSWORD 'suteki_pass_2026' CREATEDB;
  END IF;
END
$$;
SQL

sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname='suteki'" | grep -q 1 || sudo -u postgres createdb -O suteki suteki

echo "DB setup complete"
