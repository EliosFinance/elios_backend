FROM node:alpine AS development

WORKDIR /app
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY src/ ./src
RUN npm install
RUN npm run build

FROM node:alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app

COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/dist ./dist
<<<<<<< HEAD

CMD ["node", "dist/main"]
=======
 
CMD ["node", "dist/main"]
>>>>>>> fix: corrige un bug dans la fonctionnalité d'ajout d'amis
