# Dockerfile to run this in development mode
#
# If needed, check your Docker setup with
#
#    docker run -it busybox echo yes it works
#
# Then, build the image with
#
#    docker build . -t whimsy-board-agenda-dev
#
# Then get the yarn packages with
#
#    docker run -it -v $PWD:/whimsy-board-agenda whimsy-board-agenda-dev yarn install
#
# And start the server with
#
#    docker run -it -v $PWD:/whimsy-board-agenda -p 3000:3000 whimsy-board-agenda-dev
#
# If needed for troubleshooting, you can add "sh" to the end of that command to
# run a shell in that container. In that shell, "yarn dev" starts the server.
#
# Then open http://localhost:3000
#
# Changes to the source files should be taken into 
# account within a few seconds.

FROM node:14.0.0-alpine3.11 AS whimsy-board-agenda-base
RUN apk --no-cache add subversion
WORKDIR /whimsy-board-agenda

FROM whimsy-board-agenda-base AS whimsy-board-agenda-dev
COPY package.json yarn.lock /whimsy-board-agenda/
RUN yarn install --frozen-lockfile
CMD yarn dev

