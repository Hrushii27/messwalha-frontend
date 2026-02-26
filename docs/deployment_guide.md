# MessWalha Deployment Guide

This guide provides step-by-step instructions on how to deploy MessWalha to a live production server.

## 1. Prerequisites
- A Linux VPS (Ubuntu 22.04+ recommended)
- A domain name (e.g., `messwalha.com`)
- Docker & Docker Compose installed on the server

## 2. Server Setup

### Install Docker
```bash
# Update local package index
sudo apt-get update
# Install Docker
sudo apt-get install docker.io docker-compose -y
# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
```

## 3. Deployment Steps

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/sonic-pinwheel.git
cd sonic-pinwheel/messwalha
```

### Step 2: Configure Environment Variables
Copy the production template and fill in your real keys.
```bash
cp ../.env.production.example .env
nano .env
```
> [!IMPORTANT]
> Change the default passwords for Postgres and JWT!
> Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to your live keys.

### Step 3: Launch with Docker Compose
```bash
sudo docker-compose up -d --build
```

### Step 4: SSL (HTTPS) Setup
Use Nginx and Certbot to secure your site.
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Create an Nginx configuration:
```nginx
server {
    listen 80;
    server_name messwalha.com www.messwalha.com;

    location / {
        proxy_pass http://localhost:80; # Frontend Docker
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:5000; # Backend Docker
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable HTTPS:
```bash
sudo certbot --nginx -d messwalha.com -d www.messwalha.com
```

## 4. Maintenance
- **Logs**: `docker-compose logs -f`
- **Backup**: Regularly back up the `postgres_data` volume.
- **Updates**: `git pull && docker-compose up -d --build`
