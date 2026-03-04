$ErrorActionPreference = "Stop"
$KEY = "C:\Users\mizjx\Downloads\tattant.pem"
$SRV = "ubuntu@ec2-16-176-142-198.ap-southeast-2.compute.amazonaws.com"

Set-Location "c:\Users\mizjx\OneDrive\Desktop\PROJECTS\tattant"

Write-Host "=== FULL DEPLOYMENT TO TATTANT.COM ===" -ForegroundColor Cyan

# Step 1: Upload backend
Write-Host "[1/5] Uploading backend source..." -ForegroundColor Yellow
scp -i $KEY -r server/src $SRV`:/home/ubuntu/new-src
scp -i $KEY server/package.json $SRV`:/home/ubuntu/new-package.json
Write-Host "  Backend uploaded!" -ForegroundColor Green

# Step 2: Upload frontend
Write-Host "[2/5] Uploading frontend build..." -ForegroundColor Yellow
scp -i $KEY -r client/dist $SRV`:/home/ubuntu/new-dist
Write-Host "  Frontend uploaded!" -ForegroundColor Green

# Step 3: Deploy backend on server
Write-Host "[3/5] Deploying backend on server..." -ForegroundColor Yellow
ssh -i $KEY $SRV "pm2 stop tattant-server 2>/dev/null || true"
ssh -i $KEY $SRV "sudo rm -rf /opt/tattant-server/src && sudo cp -r /home/ubuntu/new-src /opt/tattant-server/src && sudo cp /home/ubuntu/new-package.json /opt/tattant-server/package.json && sudo chown -R ubuntu:ubuntu /opt/tattant-server"
ssh -i $KEY $SRV "cd /opt/tattant-server && npm install --production --silent"
ssh -i $KEY $SRV "cd /opt/tattant-server && DATABASE_URL=postgresql://suteki:suteki_pass_2026@localhost:5432/suteki NODE_ENV=production npx sequelize-cli db:migrate"
Write-Host "  Backend deployed!" -ForegroundColor Green

# Step 4: Deploy frontend on server
Write-Host "[4/5] Deploying frontend on server..." -ForegroundColor Yellow
ssh -i $KEY $SRV "sudo rm -rf /var/www/tattant/* && sudo cp -r /home/ubuntu/new-dist/* /var/www/tattant/ && sudo chown -R www-data:www-data /var/www/tattant && sudo chmod -R 755 /var/www/tattant"
Write-Host "  Frontend deployed!" -ForegroundColor Green

# Step 5: Restart services + cleanup
Write-Host "[5/5] Restarting services..." -ForegroundColor Yellow
ssh -i $KEY $SRV "pm2 delete tattant-server 2>/dev/null || true; pm2 start /opt/tattant-server/src/server.js --name tattant-server --cwd /opt/tattant-server && pm2 save"
ssh -i $KEY $SRV "sudo systemctl reload nginx"
ssh -i $KEY $SRV "rm -rf /home/ubuntu/new-src /home/ubuntu/new-dist /home/ubuntu/new-package.json"

# Verify
Write-Host ""
Write-Host "=== VERIFICATION ===" -ForegroundColor Cyan
Start-Sleep -Seconds 4
ssh -i $KEY $SRV "pm2 list"
Write-Host ""
ssh -i $KEY $SRV "curl -s http://localhost:5000/health"
Write-Host ""
Write-Host "=== DEPLOYMENT COMPLETE ===" -ForegroundColor Green
Write-Host "Visit: https://tattant.com/tattant/" -ForegroundColor Cyan
