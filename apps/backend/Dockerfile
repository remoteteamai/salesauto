FROM node:18-slim

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
