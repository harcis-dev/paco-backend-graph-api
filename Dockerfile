FROM node:latest

WORKDIR /home/node

COPY ["./package.json","./.env", "./"]
COPY ["./src", "./src"]

RUN npm install --production

EXPOSE 8088

CMD ["node", "./src/app.js"]