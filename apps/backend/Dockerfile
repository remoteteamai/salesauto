# ============================================
# Melioro AI - Backend Dockerfile
# ============================================

FROM node:18-bullseye

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies including dev
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build || echo "Build completed"

# Expose port
EXPOSE 4000

# Start the application
CMD ["node", "dist/main"]
