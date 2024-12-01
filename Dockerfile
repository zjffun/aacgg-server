###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18 AS development

# use /usr/src/app, see https://nodejs.org/en/docs/guides/nodejs-docker-webapp
WORKDIR /usr/src/app

RUN echo $SENTRY_AUTH_TOKEN

RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN \
  echo $SENTRY_AUTH_TOKEN





