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
DATABASE_URL=postgresql://suteki:suteki_pass_2026@localhost:5432/suteki
JWT_SECRET=tattant_jwt_secret_2026_production_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://www.tattant.com
EOF

# Update config.json for production to use local DB without SSL
cat > /opt/tattant-server/src/config/config.json << 'JSONEOF'
{
  "development": {
    "url": "postgresql://postgres:Aue46722@localhost:5432/tattant",
    "dialect": "postgres"
  },
  "test": {
    "url": "postgresql://postgres:Aue46722@localhost:5432/tattant_test",
    "dialect": "postgres"
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres"
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
