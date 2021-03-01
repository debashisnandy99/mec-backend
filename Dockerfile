FROM node:15.10.0-alpine3.10

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8080


CMD ["npm", "start"]
