FROM node:14.16.1

# App directory
WORKDIR /usr/src/app

COPY package*.json ./

COPY npm-shrinkwrap.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
