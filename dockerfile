# Etapa 1 - Build da aplicação
FROM node:18 AS builder

# Diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos necessários
COPY package*.json ./
COPY tsconfig*.json ./
COPY src ./src

# Instala as dependências
RUN npm install

# Compila o código TypeScript para JavaScript
RUN npm run build

# Etapa 2 - Imagem final para produção
FROM node:18

# Diretório da aplicação
WORKDIR /app

# Copia apenas os arquivos necessários para rodar a aplicação
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Instala apenas as dependências de produção
RUN npm install --only=production

# Define a porta exposta
EXPOSE 4000

# Comando para iniciar a aplicação
CMD ["node", "dist/server.js"]
