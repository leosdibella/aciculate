FROM node:18-alpine
WORKDIR /usr/src/app

COPY app ./app
COPY shared ./shared
COPY lib ./lib

USER root

WORKDIR /usr/src/app/app

RUN npm install
CMD npm run serve