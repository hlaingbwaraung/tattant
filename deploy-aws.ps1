# Tattant AWS Deployment Script
$ErrorActionPreference = "Stop"

# Configuration
$SSH_KEY = "C:\Users\mizjx\Downloads\tattant.pem"
$EC2_HOST = "ec2-16-176-142-198.ap-southeast-2.compute.amazonaws.com"
$EC2_USER = "ubuntu"
$EC2_CONN = "${EC2_USER}@${EC2_HOST}"

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Tattant AWS Deployment" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Deploy Backend
Write-Host "[1/4] Deploying Backend..." -ForegroundColor Yellow
Write-Host "  > Creating backup on server..." -ForegroundColor Gray
ssh -i $SSH_KEY $EC2_CONN "sudo cp -r /opt/tattant-server /opt/tattant-server-backup-`$(date +%Y%m%d-%H%M%S) 2>/dev/null || echo 'No backup needed'"

Write-Host "  > Uploading server files..." -ForegroundColor Gray
scp -i $SSH_KEY -r server/src "${EC2_CONN}:/home/ubuntu/tattant-server-src-tmp" | Out-Null
scp -i $SSH_KEY server/package.json "${EC2_CONN}:/home/ubuntu/tattant-server-package.json" | Out-Null
scp -i $SSH_KEY server/package-lock.json "${EC2_CONN}:/home/ubuntu/tattant-server-package-lock.json" | Out-Null

Write-Host "  > Installing and restarting backend..." -ForegroundColor Gray
ssh -i $SSH_KEY $EC2_CONN "sudo cp -r /home/ubuntu/tattant-server-src-tmp/* /opt/tattant-server/src/"
ssh -i $SSH_KEY $EC2_CONN "sudo cp /home/ubuntu/tattant-server-package.json /opt/tattant-server/package.json"
ssh -i $SSH_KEY $EC2_CONN "sudo chown -R ubuntu:ubuntu /opt/tattant-server"
ssh -i $SSH_KEY $EC2_CONN "cd /opt/tattant-server && npm install --production --silent"
ssh -i $SSH_KEY $EC2_CONN "cd /opt/tattant-server && npx sequelize-cli db:migrate"
ssh -i $SSH_KEY $EC2_CONN "pm2 restart tattant-api || pm2 start /opt/tattant-server/src/server.js --name tattant-api"
ssh -i $SSH_KEY $EC2_CONN "pm2 save"
ssh -i $SSH_KEY $EC2_CONN "rm -rf /home/ubuntu/tattant-server-src-tmp && rm /home/ubuntu/tattant-server-package*.json"
Write-Host "  [OK] Backend deployed!" -ForegroundColor Green

# Step 2: Deploy Frontend
Write-Host ""
Write-Host "[2/4] Deploying Frontend..." -ForegroundColor Yellow
Write-Host "  > Creating backup on server..." -ForegroundColor Gray
ssh -i $SSH_KEY $EC2_CONN "sudo cp -r /var/www/tattant /var/www/tattant-backup-`$(date +%Y%m%d-%H%M%S) 2>/dev/null || echo 'No backup needed'"

Write-Host "  > Uploading frontend build..." -ForegroundColor Gray
scp -i $SSH_KEY -r client/dist "${EC2_CONN}:/home/ubuntu/tattant-dist-tmp" | Out-Null

Write-Host "  > Deploying to web server..." -ForegroundColor Gray
ssh -i $SSH_KEY $EC2_CONN "sudo rm -rf /var/www/tattant/*"
ssh -i $SSH_KEY $EC2_CONN "sudo cp -r /home/ubuntu/tattant-dist-tmp/* /var/www/tattant/"
ssh -i $SSH_KEY $EC2_CONN "sudo chown -R www-data:www-data /var/www/tattant"
ssh -i $SSH_KEY $EC2_CONN "rm -rf /home/ubuntu/tattant-dist-tmp"
Write-Host "  [OK] Frontend deployed!" -ForegroundColor Green

# Step 3: Restart Nginx
Write-Host ""
Write-Host "[3/4] Restarting Nginx..." -ForegroundColor Yellow
ssh -i $SSH_KEY $EC2_CONN "sudo systemctl reload nginx"
Write-Host "  [OK] Nginx reloaded!" -ForegroundColor Green

# Step 4: Verify Deployment
Write-Host ""
Write-Host "[4/4] Verifying Deployment..." -ForegroundColor Yellow
Write-Host "--- Backend Status ---" -ForegroundColor Gray
ssh -i $SSH_KEY $EC2_CONN "pm2 status tattant-api"
Write-Host ""
Write-Host "--- Frontend Files ---" -ForegroundColor Gray
ssh -i $SSH_KEY $EC2_CONN "ls -lh /var/www/tattant/index.html"
Write-Host ""
Write-Host "--- Nginx Status ---" -ForegroundColor Gray
ssh -i $SSH_KEY $EC2_CONN "sudo systemctl status nginx | head -3"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your site should be live at: https://tattant.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "To check logs, SSH to the server and run:" -ForegroundColor Yellow
Write-Host "  pm2 logs tattant-api" -ForegroundColor Gray
Write-Host "  sudo tail /var/log/nginx/access.log" -ForegroundColor Gray
Write-Host ""
