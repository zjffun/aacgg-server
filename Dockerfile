###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18 AS development

# use /usr/src/app, see https://nodejs.org/en/docs/guides/nodejs-docker-webapp
WORKDIR /usr/src/app

RUN --mount=type=secret,id=test_sec \
    echo $(cat /run/secrets/test_sec)

RUN echo test

