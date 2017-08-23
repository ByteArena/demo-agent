FROM node:7.4.0-alpine

ENV NPM_CONFIG_LOGLEVEL error

WORKDIR /var/app

COPY . /var/app

RUN npm install

RUN npm prune --production

CMD npm start
