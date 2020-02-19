FROM alpine:latest

RUN apk update

RUN apk add nodejs

RUN apk add nodejs-npm

WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]

