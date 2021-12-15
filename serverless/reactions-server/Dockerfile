FROM node:lts-alpine
WORKDIR /usr/src/reactions
RUN apk add --no-cache --virtual .gyp
COPY . ./
RUN npm install --silent
RUN chmod +x run.sh
CMD sh run.sh