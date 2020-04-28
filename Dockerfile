# Quick hack Dockerfile to run this in development mode
#
# Build the image with
#
#    docker build . -t whimsy-board-agenda-dev
#
# Then get the yarn packages with
#
#    docker run -it -v $PWD:/whimsy-board-agenda whimsy-board-agenda-dev yarn install
#
# And start the server with
#
#    docker run -it -v $PWD:/whimsy-board-agenda -p 3000:3000 whimsy-board-agenda-dev yarn dev
#
# You can use "bash" instead of "yarn dev" to run a shell in that container, for
# troubleshooting.
#
# Then open http://localhost:3000
#
# Changes to the source files should be taken into 
# account within a few seconds.

FROM ubuntu:bionic

RUN apt update \
  && apt-get install -y \
    curl \
    git \
    subversion
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn
RUN apt-get clean && rm -rf /var/lib/apt/lists/

WORKDIR /whimsy-board-agenda
CMD bash