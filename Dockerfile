# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments passed from compose.yaml
ARG VITE_API_BASE_URL
ARG VITE_WS_BASE_URL
ARG VITE_THIRDWEB_CLIENT_ID

# Set as ENV so Vite can use them during build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_WS_BASE_URL=$VITE_WS_BASE_URL \
    VITE_THIRDWEB_CLIENT_ID=$VITE_THIRDWEB_CLIENT_ID

# Build the application
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports
EXPOSE 80 5173

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
