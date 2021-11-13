FROM node:16.5.0-alpine3.14

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 8000

CMD ["node", "server.js"]

