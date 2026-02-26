# MessWalha Deployment Guide

## Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- PostgreSQL (if running without Docker)

## Local Development
1. Clone the repository.
2. Setup environment variables:
   - `backend/.env`
   - `frontend/.env`
3. Run `npm install` in both directories.
4. Start development servers:
   - Backend: `npm run dev`
   - Frontend: `npm run dev`

## Deployment with Docker (Recommended)
The easiest way to deploy MessWalha is using Docker Compose.

1. Build and start the containers:
   ```bash
   docker-compose up --build -d
   ```
2. The services will be available at:
   - Frontend: `http://localhost:80` (via Nginx)
   - Backend: `http://localhost:5000`
   - Postgres: `localhost:5432`

## Production Checklist
- [ ] Update `JWT_SECRET` in `docker-compose.yml` or `.env`.
- [ ] Configure SSL via Nginx (Certbot/Let's Encrypt).
- [ ] Set `NODE_ENV=production`.
- [ ] Configure backup schedule for PostgreSQL volume.
- [ ] Set up monitoring (e.g., Prometheus/Grafana).
