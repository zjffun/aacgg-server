###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18 AS development

# use /usr/src/app, see https://nodejs.org/en/docs/guides/nodejs-docker-webapp
WORKDIR /usr/src/app

COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./
RUN yarn install

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:18 AS build

WORKDIR /usr/src/app

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node package.json ./
COPY --chown=node:node yarn.lock ./
COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node tsconfig.build.json ./
COPY --chown=node:node nest-cli.json ./
COPY --chown=node:node src ./src

ENV NODE_ENV=production

RUN yarn run build
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
  SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) \
  yarn run sentry:sourcemaps

RUN yarn install --immutable --immutable-cache --check-cache && yarn cache clean

USER node

###################
# PRODUCTION
###################

FROM node:18-alpine AS production

WORKDIR /usr/src/app

COPY --chown=node:node .env.vault ./
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

RUN apk add git
RUN git init

CMD [ "node", "dist/main.js" ]
