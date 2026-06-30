# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /usr/src/app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Assemble Full-Stack Application
FROM node:18-alpine
WORKDIR /usr/src/app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# Copy built static frontend files into expected relative path from backend/src/server.js (../../frontend/dist -> /usr/src/app/frontend/dist)
COPY --from=frontend-builder /usr/src/app/frontend/dist ./frontend/dist

# Expose port (Google Cloud Run dynamically overrides PORT environment variable)
EXPOSE 5000
ENV NODE_ENV=production

# Start Express Server
CMD ["node", "backend/src/server.js"]
