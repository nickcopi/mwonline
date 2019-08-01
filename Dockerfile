FROM node:latest

WORKDIR /app

COPY mwserver /app

RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]

