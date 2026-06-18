# ============================================
# Melioro AI - Backend Dockerfile
# ============================================

FROM node:20-alpine

WORKDIR /app

# Install all dependencies for build
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

# Start
CMD ["node", "dist/main"]