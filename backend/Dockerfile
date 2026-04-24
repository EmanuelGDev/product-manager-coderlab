FROM node:20-alpine

WORKDIR /app

# Instala dependências primeiro (cache layer)
COPY package*.json ./
RUN npm install

# Copia tudo ANTES de gerar o Prisma Client
COPY . .

# Agora o schema.prisma existe e o generate funciona
RUN npx prisma generate

# Compila o TypeScript
RUN npm run build

EXPOSE 3000

# Usa o build compilado, não o watch mode
CMD ["node", "dist/main"]