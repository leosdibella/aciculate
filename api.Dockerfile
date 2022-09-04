FROM node:18-alpine
WORKDIR /usr/src/app

COPY api ./api
COPY shared ./shared

USER root

WORKDIR /usr/src/app/api

RUN npm install
CMD npm run start