FROM node:16 as build

WORKDIR /app

COPY package*.json ./
RUN npm i --no-audit
COPY . .
RUN npm run build

##################################

FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm pkg set scripts.prepare="ls"
RUN npm i --no-audit --omit=dev

COPY --from=build /app/dist .

CMD ["node", "src/index.js"]
