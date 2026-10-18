FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Vite bakea import.meta.env.VITE_* en el bundle en tiempo de build, no de
# arranque del contenedor: por eso va como build arg (docker/compose.app.yml
# lo pasa desde VITE_API_URL de docker/.env), no como variable de entorno del
# contenedor final.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
