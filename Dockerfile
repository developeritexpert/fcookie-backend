FROM node:20-alpine

# Install dependencies for building native modules
RUN apk add --no-cache python3 make g++ bash

WORKDIR /app

# Copy only package.json for caching
COPY package*.json ./

RUN npm install --production

# Copy the full project
COPY . .

# Use PM2 to keep app alive
RUN npm install pm2 -g

EXPOSE 4000

ENV NODE_ENV=production

CMD ["pm2-runtime", "server.js"]
