# Statyczne CSS/JS omijają Next — Instagram i świeża przeglądarka
# dostawały 500 na głównym arkuszu (Turbopack + Connection: upgrade).
location ^~ /_next/static/ {
    alias /var/www/sofelio/.next/static/;
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    add_header X-Content-Type-Options "nosniff" always;
    access_log off;
}

location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 120s;
}
