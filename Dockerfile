FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm i --omit=dev
COPY src ./src
COPY .env.prod ./
USER app
EXPOSE 8080
CMD ["node","src/index.js"]
