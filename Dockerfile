# Etapa de build
# Node 24: Angular CLI 22.2 exige Node >= 22.22.3 o >= 24.15.
FROM node:24-alpine AS build
WORKDIR /app
# Se copia también package-lock.json y se usa `npm ci` para builds reproducibles
# (mismas versiones exactas que en CI).
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build -- --configuration production

# Etapa de servido
FROM nginx:alpine
COPY --from=build /app/dist/itinerarios-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
