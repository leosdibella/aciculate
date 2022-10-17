FROM node:18-alpine

RUN apk add --update openssl && \
    rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

COPY app ./app
COPY shared ./shared
COPY lib ./lib

USER root

WORKDIR /usr/src/app/shared

RUN npm install

WORKDIR /usr/src/app/lib/typescript

RUN npm install

WORKDIR /usr/src/app/app

RUN openssl req \
  -x509 \
 -newkey rsa:2048 \
 -keyout keytmp.pem \
 -out cert.pem \
 -days 365 \
 -passout pass:password \
 -subj "/C=US/ST=New York/L=Buffalo/O=aciculate/OU=Engineering/CN=localhost/emailAddress=noreply@example.com"

RUN openssl rsa \
-passin pass:password \
-in keytmp.pem \
-out key.pem 

RUN npm install
CMD npm run serve
