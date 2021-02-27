FROM node:15.10.0-alpine3.10

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8080

ENV MONGODB_USERNAME=root
ENV MONGODB_PASSWORD=secret

CMD ["npm", "start"]
