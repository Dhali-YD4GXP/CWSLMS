FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build Next.js App
ENV NEXT_PUBLIC_API_URL=https://cws.dhali.my.id/api
RUN npm run build

EXPOSE 3000

# Start Production Server
CMD ["npm", "start"]
