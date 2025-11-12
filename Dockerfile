FROM node:18-bullseye

# instalar dependências do sistema (ImageMagick + potrace)
RUN apt-get update && \
    apt-get install -y imagemagick potrace && \
    rm -rf /var/lib/apt/lists/*

# criar diretório da app
WORKDIR /usr/src/app

# copiar package.json e instalar dependências node
COPY package*.json ./
RUN npm install --production

# copiar código
COPY . .

# expor porta e start
EXPOSE 3000
CMD ["node", "server.js"]
