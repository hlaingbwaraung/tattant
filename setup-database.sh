#!/bin/bash

echo "========================================"
echo "Tattant Database Setup Script"
echo "========================================"
echo ""

# Check if PostgreSQL is installed
echo "Step 1: Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo "ERROR: PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL first"
    exit 1
fi
echo "PostgreSQL found!"
echo ""

# Create database
echo "Step 2: Creating database..."
echo "Please enter your PostgreSQL password when prompted."
psql -U postgres -c "CREATE DATABASE tattant;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "Database 'tattant' created successfully!"
else
    echo "Database might already exist or there was an error."
    echo "This is usually OK - continuing..."
fi
echo ""

# Run migrations
echo "Step 3: Running migrations..."
cd server
npm run db:migrate
if [ $? -ne 0 ]; then
    echo "ERROR: Migration failed!"
    exit 1
fi
echo "Migrations completed!"
echo ""

# Seed data
echo "Step 4: Seeding initial data..."
npm run db:seed
if [ $? -ne 0 ]; then
    echo "ERROR: Seeding failed!"
    exit 1
fi
echo "Seeding completed!"
echo ""

echo "========================================"
echo "Database setup complete!"
echo "========================================"
echo ""
echo "Created:"
echo "- 6 categories"
echo "- ~10 sample businesses"
echo "- 2 test users"
echo ""
echo "Test Accounts:"
echo "  Admin: admin@tattant.com / admin123"
echo "  User:  test@example.com / test123"
echo ""
echo "Next steps:"
echo "  1. cd server"
echo "  2. npm run dev"
echo ""
