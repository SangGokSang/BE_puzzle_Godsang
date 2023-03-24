FROM node:18.12.1

RUN mkdir -p /var/app
WORKDIR /var/app

RUN npm install

RUN npm run build

EXPOSE 3000

ENTRYPOINT npm run start:prod