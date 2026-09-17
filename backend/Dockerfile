# Coincide con el Node 20 LTS de claude_docs/SPEC.md, aunque el host de
# desarrollo tenga una versión distinta instalada (solo importa la versión
# que corre dentro del contenedor).
#
# ponytail: @hyperledger/fabric-gateway (desde T5) declara "engines":
# {"node": ">=22.12.0"} en su package.json, pero npm no lo hace cumplir sin
# engine-strict — hoy corre bien sobre Node 20 (verificado end-to-end), pero
# es un mismatch real: un futuro `npm update` de esa dependencia podría
# empezar a depender de una API exclusiva de Node 22 sin que ningún
# build/lint/test lo detecte antes de producción. Subir a node:22-alpine
# resolvería la raíz, pero es una decisión de stack (SPEC.md ya fija Node 20
# LTS) que no corresponde cambiar en este sprint sin acordarlo antes.
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
