# Dockerfile for My Micro Workouts
# Note: This is primarily for reference. The app is designed to run on Cloudflare Pages.
# If deploying to containers, consider using a different architecture.

FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY functions/ ./functions/
COPY public/ ./public/
COPY db/ ./db/

# Build TypeScript
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/db ./db

# Expose port
EXPOSE 8788

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8788/api/auth/me', (r) => process.exit(r.statusCode === 401 ? 0 : 1))"

# Note: This Dockerfile is for reference only.
# The application is optimized for Cloudflare Pages deployment.
# Running in containers requires additional configuration for D1 database access.

CMD ["echo", "This app is designed for Cloudflare Pages. See README.md for deployment instructions."]
