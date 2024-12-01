###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18 AS development

# use /usr/src/app, see https://nodejs.org/en/docs/guides/nodejs-docker-webapp
WORKDIR /usr/src/app

RUN echo $SENTRY_AUTH_TOKEN1

RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN1,env=SENTRY_AUTH_TOKEN1 \
  echo $SENTRY_AUTH_TOKEN1

RUN echo test111

RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN export

RUN echo ****

RUN echo test111

RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN1,env=SENTRY_AUTH_TOKEN1 echo $SENTRY_AUTH_TOKEN1

RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN1,env=SENTRY_AUTH_TOKEN1 export

RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN1,env=SENTRY_AUTH_TOKEN2 export

RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN1,env=SENTRY_AUTH_TOKEN2 echo $SENTRY_AUTH_TOKEN1

RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN2,env=SENTRY_AUTH_TOKEN2 echo $SENTRY_AUTH_TOKEN2

RUN echo test222

