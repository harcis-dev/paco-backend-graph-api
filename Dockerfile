FROM node:latest

SHELL ["/bin/bash", "-c"]

WORKDIR /home/node

COPY ["./scripts/docker-startup.sh", "./package.json", "./package-lock.json","./.env", "./"]
COPY ["./src", "./src"]

RUN npm install --production

EXPOSE 8080

CMD ["./docker-startup.sh"]