FROM node:latest

WORKDIR /home/node

COPY ["./package.json","./.env", "./"]
COPY ["./src", "./src"]

RUN npm install --production

EXPOSE 8080

CMD ["node", "./src/index.js"]