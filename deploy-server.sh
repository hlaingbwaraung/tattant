#!/bin/bash
set -e

# Create server directory
sudo mkdir -p /opt/tattant-server
sudo chown ubuntu:ubuntu /opt/tattant-server

# Move uploaded files
cp -r /home/ubuntu/server-src-tmp/* /opt/tattant-server/ 2>/dev/null || true
mkdir -p /opt/tattant-server/src
# If the src structure was preserved
if [ -d "/home/ubuntu/server-src-tmp/config" ]; then
    cp -r /home/ubuntu/server-src-tmp/* /opt/tattant-server/src/
fi
cp /home/ubuntu/server-package.json /opt/tattant-server/package.json

# Create .sequelizerc
cat > /opt/tattant-server/.sequelizerc << 'EOF'
const path = require('path');

module.exports = {
  'config': path.resolve('src', 'config', 'config.json'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('src', 'seeders'),
  'migrations-path': path.resolve('src', 'migrations')
};
EOF

# Create .env file
cat > /opt/tattant-server/.env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:Ngulaymizlay778899@db.zekwwhrmosxlleoqrqyc.supabase.co:5432/postgres
DB_SSL=true
JWT_SECRET=tattant_jwt_secret_2026_production_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://tattant.com

# Google OAuth
GOOGLE_CLIENT_ID=42655523729-p7n6gum8okmufu3tj6abb7b6olenvdsm.apps.googleusercontent.com

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=hba.nihon@gmail.com
EMAIL_PASSWORD=xsin dqco ewdt tczj
EMAIL_FROM="tattant <noreply@tattant.com>"
EOF

# Update config.json for production to use Supabase with SSL
cat > /opt/tattant-server/src/config/config.json << 'JSONEOF'
{
  "development": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  },
  "test": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
}
JSONEOF

# Install dependencies
cd /opt/tattant-server
npm install --production 2>&1 | tail -5

# Run migrations
npx sequelize-cli db:migrate 2>&1 | tail -10

echo "Server setup complete!"
ls -la /opt/tattant-server/
