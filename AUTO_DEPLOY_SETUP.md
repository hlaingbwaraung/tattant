# Tattant Auto Deploy Setup

This repo is configured to auto deploy to `https://tattant.com` when you push to the `main` branch.

## What Deploys

- Frontend: `client/` builds with Vite and uploads `client/dist/` to `/var/www/tattant/`.
- Backend: `server/` uploads to `/opt/tattant-server/`, installs production packages, runs Sequelize migrations, and restarts PM2 process `tattant-server`.
- Database: PostgreSQL, connected through the backend `DATABASE_URL` environment variable.

## Required GitHub Secrets

Add these in GitHub:

`Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`

```text
EC2_HOST=ec2-16-176-142-198.ap-southeast-2.compute.amazonaws.com
EC2_USER=ubuntu
EC2_SSH_KEY=<contents of your tattant.pem private key>
```

Do not commit the `.pem` file or `.env` files to GitHub.

## Required EC2 Server Files

The server must keep this file:

```text
/opt/tattant-server/.env
```

Minimum required values:

```text
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DB_SSL=true
JWT_SECRET=change-this-to-a-long-random-secret
FRONTEND_URL=https://tattant.com
```

Add optional keys there too, such as Google login, email, and Gemini settings.

## Daily Workflow

After fixing code locally:

```bash
git add .
git commit -m "Describe the fix"
git push tattant main
```

GitHub Actions will deploy automatically. You can watch it in:

```text
https://github.com/hlaingbwaraung/tattant/actions
```

## Manual Deploy From This PC

You can still deploy manually with:

```powershell
.\deploy-aws.ps1
```

Use this only when you need a direct deploy from your machine. Normal updates should go through GitHub Actions.

## Quick Checks

Live frontend:

```text
https://tattant.com
```

Backend health:

```text
https://tattant.com/health
```

Server logs:

```bash
pm2 logs tattant-server
```
