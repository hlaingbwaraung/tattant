#!/bin/bash
set -e
sudo -u postgres psql <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'tattant') THEN
    CREATE USER tattant WITH PASSWORD 'tattant_pass_2026' CREATEDB;
  END IF;
END
$$;
SQL

sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname='tattant'" | grep -q 1 || sudo -u postgres createdb -O tattant tattant

echo "DB setup complete"
