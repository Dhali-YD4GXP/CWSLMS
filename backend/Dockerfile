FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and prisma schema
COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 5000

# Server di-start via docker-compose (migrate & run)
CMD ["npx", "ts-node", "src/index.ts"]
