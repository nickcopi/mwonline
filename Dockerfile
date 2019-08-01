FROM nodejs:latest

WORKDIR /app

COPY mwserver /app

RUN npm install

EXPOSE 3040

CMD ["node", "server.js"]

