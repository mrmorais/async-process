FROM node:14.17.6-stretch-slim

WORKDIR /usr/src/app
COPY . .
RUN npm install

EXPOSE 4000
EXPOSE 8080