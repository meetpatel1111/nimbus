FROM node:18-bullseye
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production --no-optional
COPY . .
EXPOSE 4000
CMD ["node","index.js"]
