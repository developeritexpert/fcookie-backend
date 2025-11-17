FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production --silent

COPY . .

EXPOSE 4000

ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
