FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Gera o client e sobe o servidor
CMD ["sh", "-c", "npx prisma generate && npm run start:dev"]