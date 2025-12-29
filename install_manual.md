# E-Commerce Production Installation Manual

This guide describes how to deploy the application to a VPS (Ubuntu/Debian) using Docker and system-level Nginx.

## Prerequisites
- A VPS (Virtual Private Server) with Ubuntu 20.04 or 22.04.
- A domain name pointing to your VPS IP address (A Record).
- SSH access to your VPS.

## 1. Initial VPS Setup
Update packages:
```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Install Docker & Docker Compose
```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Install Docker:
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
```

## 3. Install Nginx & Certbot
We use Nginx on the host to route traffic and handle SSL.
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

## 4. Deploy the Application
### 4.1 Clone the Code
```bash
cd /var/www
# Replace with your actual git repo
git clone https://github.com/your/repo.git ecom
cd ecom
```

### 4.2 Application Configuration (.env)
Create a `.env` file for production usage (do NOT commit this).
```bash
nano .env
```
Paste your production variables (see `.env.example`). Important defaults:
```ini
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
SECRET_KEY=super-secret-key
ALLOWED_HOSTS=www.your-domain.com
CORS_ALLOWED_ORIGINS=https://www.your-domain.com
CSRF_TRUSTED_ORIGINS=https://www.your-domain.com
NEXT_PUBLIC_API_URL=https://www.your-domain.com/api/v1

# Ports (Default 8000/3000)
BACKEND_PORT=8000
FRONTEND_PORT=3000
```

### 4.3 Configure Nginx
1. Copy the production config:
   ```bash
   sudo cp ecom_production_nginx.conf /etc/nginx/sites-available/ecom
   ```
2. Edit the config to match your domain and mapping paths:
   ```bash
   sudo nano /etc/nginx/sites-available/ecom
   ```
   *Change `server_name` to your domain.*
   *Verify `alias` paths for static/media match `/var/www/ecom/...`.*

3. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ecom /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### 4.4 Build and Run
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 5. SSL Setup (HTTPS)
Use Certbot to automatically configure SSL.
```bash
sudo certbot --nginx -d www.your-domain.com
```
Follow the prompts. Certbot will update your Nginx config to force HTTPS.

---

## 6. Hosting Multiple Sites (Second Instance)
To run a **second website** (e.g., `shop-b.com`) on the **same VPS**:

1. **Clone to a new folder**:
   ```bash
   git clone https://github.com/your/repo.git ecom_second
   cd ecom_second
   ```

2. **Configure `.env` with NEW PORTS**:
   Inside `ecom_second/.env`, change the ports so they don't clash with the first app:
   ```ini
   # ... other vars ...
   ALLOWED_HOSTS=www.shop-b.com
   CORS_ALLOWED_ORIGINS=https://www.shop-b.com
   CSRF_TRUSTED_ORIGINS=https://www.shop-b.com
   NEXT_PUBLIC_API_URL=https://www.shop-b.com/api/v1
   
   # Use DIFFERENT ports
   BACKEND_PORT=8001
   FRONTEND_PORT=3001
   ```

3. **Configure Nginx for the new site**:
   - Copy `ecom_production_nginx.conf` to `/etc/nginx/sites-available/ecom_second`.
   - Edit it:
     - `server_name www.shop-b.com;`
     - `proxy_pass http://127.0.0.1:8001;` (Backend)
     - `proxy_pass http://127.0.0.1:3001;` (Frontend)
   - Enable it: `sudo ln -s ...` and reload nginx.

4. **Run Docker**:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

You now have two completely isolated shops running on the same VPS!
