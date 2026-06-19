FROM node:18-slim

# Install OpenSSL for Prisma's native query engine
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy source
COPY . .

# Build
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/main"]
