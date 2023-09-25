FROM node:18 as builder

WORKDIR /src

ENV VITE_GERAETE_EVENTS=1

COPY package.json package-lock.json /src/
RUN npm ci
COPY ./ /src
RUN ./node_modules/.bin/vue-tsc
RUN ./node_modules/.bin/vite build

FROM nginx:1.19

COPY --from=builder /src/dist /usr/share/nginx/html