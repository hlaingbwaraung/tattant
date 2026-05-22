# Codex Project State: Tattant

Last updated: 2026-05-23 JST

## Production

- Public site: https://tattant.com/
- Render fallback URL: https://tattant.onrender.com/
- Backend health check: https://tattant.com/health
- API base URL: same-origin `/api`
- Current production host: Render web service `tattant`
- Current database: Render Postgres `tattant-db`
- Domain registrar/DNS: GoDaddy

## DNS

- `tattant.com` points to Render with an A record: `216.24.57.1`
- `www.tattant.com` points to Render with a CNAME: `tattant.onrender.com`
- Render custom domains are configured so `www.tattant.com` redirects to `https://tattant.com/`
- AWS/EC2 is no longer used for production. Do not route traffic back to the old EC2 IP.

## Free Plan Limits

- Render web service is on the Free instance type: 512 MB RAM and 0.1 CPU.
- Free web services spin down after 15 minutes without inbound traffic and can take about one minute to wake up.
- Workspace receives 750 free instance hours per calendar month.
- Hobby workspace includes 5 GB outbound bandwidth per month.
- Free Render Postgres has 1 GB storage, 256 MB RAM, and 100 connections.
- Free Render Postgres expires 30 days after creation. This database was created around 2026-05-22 UTC, so upgrade or migrate before about 2026-06-21 UTC / 2026-06-22 JST.
- Free Render Postgres has no backups.

## Deployment Workflow

- Source repository: `hlaingbwaraung/tattant`, branch `main`.
- Render deploys from `render.yaml`.
- Current production build command installs server/client dependencies, builds the Vite client, runs Sequelize migrations, and seeds data.
- Current production start command: `node server/src/server.js`.
- Do not store deploy hooks, database URLs, passwords, private keys, OTPs, or OAuth secrets in this file.

## Recovery Notes

- If `tattant.com` works but `/api/*` fails, check Render service logs and `DATABASE_URL`.
- If `www.tattant.com` fails, check GoDaddy CNAME and Render custom-domain certificate status.
- If the app becomes slow after idle time, that is expected on Render Free because the service sleeps.
- If the database stops working near late June 2026, check whether the Free Postgres database expired.
