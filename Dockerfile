FROM node:12 as builder

WORKDIR /src

ENV VITE_GERAETE_EVENTS=1

COPY package.json yarn.lock /src/
RUN yarn --frozen-lockfile
COPY ./ /src
RUN yarn build

FROM nginx:1.19

COPY --from=builder /src/dist /usr/share/nginx/html