FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY src ./src
COPY sql ./sql

ENV NODE_ENV=production
ENV PORT=4100

EXPOSE 4100

CMD ["npm", "start"]