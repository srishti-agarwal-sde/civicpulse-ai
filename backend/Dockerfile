# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package descriptors
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src
# Copy uploads folder structure placeholder (uploads will be generated on runtime, but let's make it available)
RUN mkdir -p uploads

# Expose port (Google Cloud Run dynamically sets PORT env var)
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Command to start server
CMD ["node", "src/server.js"]
