# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build production assets
RUN npm run production

# Stage 2: Production stage
FROM node:18-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist  # adjust if your build folder is different
COPY --from=builder /app/server.js ./server.js  # adjust entry file if needed

# Expose app port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
