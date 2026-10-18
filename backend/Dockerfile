# Node 20 LTS, como fija el SPEC.
# ponytail: @hyperledger/fabric-gateway declara Node >= 22.12. Funciona en 20,
# pero una actualización podría romperlo: pasar a node:22-alpine si ocurre.
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build --chown=node:node /app/dist ./dist
# Usuario sin privilegios que ya trae la imagen.
USER node
EXPOSE 8080
CMD ["node", "dist/server.js"]
