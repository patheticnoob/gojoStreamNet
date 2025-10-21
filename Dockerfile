FROM node:16.17.0-alpine as builder
WORKDIR /app
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn install
COPY . .
# Anime API endpoints are public and don't require API keys
ENV VITE_APP_HIANIME_API_BASE_URL="https://hianime-api-jzl7.onrender.com/api/v1"
ENV VITE_APP_YUMA_API_BASE_URL="https://yumaapi.vercel.app"
RUN yarn build

FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist .
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]