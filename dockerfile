# ========================
# 1ª Etapa: Build
# ========================
FROM node:20-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json (se tiver) primeiro para aproveitar cache
COPY package*.json ./

# Instalar apenas dependências de desenvolvimento para compilar
RUN npm install

# Copiar o restante dos arquivos
COPY . .

# Compilar o TypeScript
RUN npm run build

# ========================
# 2ª Etapa: Runtime (produção)
# ========================
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas o que precisa para rodar
COPY package*.json ./
RUN npm install --only=production

# Copiar o resultado do build
COPY --from=builder /app/dist ./dist

# Variável de ambiente opcional
ENV NODE_ENV=production

# Expor a porta (muda se sua app ouvir em outra porta)
EXPOSE 4000

# Comando para iniciar
CMD ["node", "dist/server.js"]
