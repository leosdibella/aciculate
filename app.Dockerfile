FROM node:18-alpine

RUN apk add --update openssl && \
    rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

COPY app ./app
COPY shared ./shared
COPY lib ./lib

USER root

WORKDIR /usr/src/app/app

# openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365 -passout pass:password -subj "/C=US/ST=New York/L=Buffalo/O=aciculate/OU=Engineering/CN=localhost/emailAddress=noreply@example.com"
RUN openssl req \
  -x509 \
 -newkey rsa:2048 \
 -keyout keytmp.pem \
 -out cert.pem \
 -days 365 \
 -passout pass:${ACICULATE_APP_SSL_CERT_PASSWORD} \
 -subj "/C=${ACICULATE_APP_SSL_CERT_COUNTRY}/ST=${ACICULATE_APP_SSL_CERT_STATE}/L=${ACICULATE_APP_SSL_CERT_LOCALITY}/O=${ACICULATE_APP_SSL_CERT_ORGANIZATION_NAME}/OU=${ACICULATE_APP_SSL_CERT_ORGANIZATIONAL_UNIT_NAME}/CN=${ACICULATE_APP_SSL_CERT_ORGANIZATIONAL_COMMON_NAME}/emailAddress=${ACICULATE_APP_SSL_CERT_EMAIL_ADDRESS}"

# openssl rsa -passin pass:password -in keytmp.pem -out key.pem
RUN openssl rsa \
-passin pass:${ACICULATE_APP_SSL_CERT_PASSWORD} \
-in keytmp.pem \
-out key.pem 

RUN npm install
CMD npm run serve
