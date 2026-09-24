# ==========================================
# Stage 1: Build Angular Application
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Disable Angular CLI analytics during build
ENV NG_CLI_ANALYTICS=false

# Install dependencies first (leverages Docker layer cache)
COPY package*.json ./
RUN npm ci

# Copy the application source code and build
COPY . .
RUN npm run build -- --configuration production

# ==========================================
# Stage 2: Production Web Server (Nginx)
# ==========================================
FROM nginx:1.27-alpine AS production

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built artifacts from the build stage
COPY --from=build /app/dist/process-management-ui/browser /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Healthcheck to verify container is healthy
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
