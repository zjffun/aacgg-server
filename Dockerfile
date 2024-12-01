###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18 AS development

# use /usr/src/app, see https://nodejs.org/en/docs/guides/nodejs-docker-webapp
WORKDIR /usr/src/app

RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
  export SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN)

RUN export

RUN echo test

