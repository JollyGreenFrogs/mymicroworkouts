FROM nginx:1.27-alpine
# Build context is the repo root so we can reach both public/ and nginx/
COPY public/ /usr/share/nginx/html/
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
