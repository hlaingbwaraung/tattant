# Database Setup Guide

## Prerequisites

### Install PostgreSQL

**Windows:**
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer (recommended version: 14 or higher)
3. Default port: 5432
4. Remember your postgres user password

**Mac (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Step 1: Create Database

### Option 1: Using psql (Command Line)

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql, create the database
CREATE DATABASE tattant;

# Verify
\l

# Exit
\q
```

### Option 2: Using pgAdmin (GUI)

1. Open pgAdmin
2. Right-click "Databases"
3. Select "Create" > "Database"
4. Name: `tattant`
5. Click "Save"

## Step 2: Configure Environment Variables

Update `server/.env` with your PostgreSQL credentials:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/tattant
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tattant
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

## Step 3: Run Migrations

```bash
cd server
npm run db:migrate
```

This will create all the tables (users, categories, businesses, saved_businesses).

## Step 4: Seed Initial Data

```bash
npm run db:seed
```

This will populate:
- 6 initial categories (Telecom, Ramen, Sushi, Yakiniku, Bookstores, Currency Exchange)
- 3-5 sample businesses per category
- 1 test admin user

## Step 5: Verify

```bash
# Connect to database
psql -U postgres -d tattant

# Check tables
\dt

# Check categories
SELECT name_en, slug FROM categories;

# Check businesses count
SELECT COUNT(*) FROM businesses;

# Exit
\q
```

## Common Issues

### "psql: error: connection to server failed"
- Make sure PostgreSQL is running
- Windows: Check Services for "postgresql-x64-14"
- Mac: `brew services list`
- Linux: `sudo systemctl status postgresql`

### "password authentication failed"
- Double-check your password in `.env`
- Reset password: `ALTER USER postgres WITH PASSWORD 'newpassword';`

### "database tattant does not exist"
- Run `CREATE DATABASE tattant;` in psql first

### Port 5432 already in use
- Another PostgreSQL instance is running
- Check: `lsof -i :5432` (Mac/Linux) or Task Manager (Windows)

## Next Steps

Once setup is complete, you can:
1. Start the backend: `npm run dev`
2. Access the health check: http://localhost:5000/health
3. Continue to Phase 2 implementation
