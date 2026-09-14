# Coincide con el Node 20 LTS de claude_docs/SPEC.md, aunque el host de
# desarrollo tenga una versión distinta instalada (solo importa la versión
# que corre dentro del contenedor).
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
# node:20-alpine ya trae un usuario no-root (uid 1000) listo para usar.
USER node
EXPOSE 8080
CMD ["node", "dist/server.js"]
