# Quick Database Setup Guide

## Windows Users

1. **Make sure PostgreSQL is installed and running**
   - Check in Services: Look for "postgresql-x64-14" or similar
   - Or download from: https://www.postgresql.org/download/windows/

2. **Update server/.env with your password**
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/suteki
   DB_PASSWORD=YOUR_PASSWORD
   ```

3. **Run the automated setup script**
   ```bash
   # From the project root
   setup-database.bat
   ```

   This will:
   - Create the `suteki` database
   - Run all migrations (create tables)
   - Seed initial data

4. **Verify setup**
   ```bash
   psql -U postgres -d suteki
   \dt                    # List all tables
   SELECT COUNT(*) FROM businesses;  # Should show ~10
   \q                     # Exit
   ```

## Mac/Linux Users

1. **Make sure PostgreSQL is installed**
   ```bash
   # Mac (Homebrew)
   brew install postgresql@14
   brew services start postgresql@14

   # Linux (Ubuntu/Debian)
   sudo apt install postgresql
   sudo systemctl start postgresql
   ```

2. **Update server/.env with your password**
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/suteki
   DB_PASSWORD=YOUR_PASSWORD
   ```

3. **Run the automated setup script**
   ```bash
   # Make executable
   chmod +x setup-database.sh

   # Run setup
   ./setup-database.sh
   ```

4. **Verify setup**
   ```bash
   psql -U postgres -d suteki
   \dt                    # List all tables
   SELECT COUNT(*) FROM businesses;  # Should show ~10
   \q                     # Exit
   ```

## Manual Setup (If Script Fails)

```bash
# 1. Create database
psql -U postgres
CREATE DATABASE suteki;
\q

# 2. Run migrations
cd server
npm run db:migrate

# 3. Seed data
npm run db:seed
```

## What Gets Created

**6 Categories:**
- 📶 Telecom & SIM Cards
- 🍜 Ramen Restaurants
- 🍣 Sushi Restaurants
- 🥩 Yakiniku & BBQ
- 📚 Book Stores
- 💱 Currency Exchange

**~10 Sample Businesses:**
- Sakura Mobile (SIM cards)
- Japan Wireless (eSIM)
- Ichiran Ramen
- Afuri Ramen
- Sushi Zanmai
- Gyukaku (Yakiniku)
- Kinokuniya (Bookstore)
- Travelex (Currency Exchange)

**2 Test Users:**
- Admin: `admin@suteki.com` / `admin123`
- User: `test@example.com` / `test123`

## Test the Backend

```bash
# Start server
cd server
npm run dev

# In another terminal, test the health endpoint
curl http://localhost:5000/health

# Should return: {"status":"OK","message":"Server is running"}
```

## Common Issues & Solutions

### "psql: command not found"
- PostgreSQL is not installed or not in PATH
- **Windows:** Add `C:\Program Files\PostgreSQL\14\bin` to PATH
- **Mac:** `brew install postgresql@14`
- **Linux:** `sudo apt install postgresql`

### "password authentication failed"
- Wrong password in `.env`
- Reset: `ALTER USER postgres WITH PASSWORD 'newpassword';`

### "database suteki already exists"
- This is fine! Just continue with migrations
- Or drop and recreate: `DROP DATABASE suteki; CREATE DATABASE suteki;`

### "relation already exists" during migration
- Tables already created
- Solution: `npm run db:migrate:undo` then `npm run db:migrate`

### "Cannot find module 'uuid'"
- Dependencies not installed
- Solution: `cd server && npm install`

## Next Steps

Once database is set up:

1. ✅ Database is ready
2. ⏭️ Start the backend: `cd server && npm run dev`
3. ⏭️ Build authentication controllers
4. ⏭️ Build API routes
5. ⏭️ Build frontend components

Or continue to **Phase 2: Backend Core** to implement:
- Auth controllers (register, login, JWT)
- Category and business routes
- Email verification
- Google OAuth
