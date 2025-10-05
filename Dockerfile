# Stage 1: Build assets
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run production

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy only production files
COPY package*.json ./
RUN npm ci --production

COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/resources ./resources

EXPOSE 3100

CMD ["node", "server.js"]
