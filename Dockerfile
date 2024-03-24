FROM node:18-alpine3.17

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD npm run start
