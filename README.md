# [aacgg](https://aacgg.com/)

AACGG ACG Group.

# Development

```bash
docker compose -f docker-compose.dev.yml up --build
```

# Docker Deploy

```bash
sudo docker stop aacgg-server
sudo docker remove aacgg-server
sudo docker pull zjffun/aacgg-server
sudo docker run -e DOTENV_KEY="dotenv://:key_1234@dotenv.org/vault/.env.vault?environment=production" -d --restart=always --name aacgg-server -p 30002:30002 zjffun/aacgg-server:latest
sudo docker logs aacgg-server
```

NGINX config:

```bash
sudo cat <<'EOF' > /etc/nginx/sites-enabled/aacgg-server-aacgg-com
server {
    server_name aacgg-server.aacgg.com;
    listen 80;

    location / {
        proxy_pass http://localhost:30002;
    }
}
EOF
```
