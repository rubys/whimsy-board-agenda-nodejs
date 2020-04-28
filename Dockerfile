# Quick hack Dockerfile to run this in development mode
#
# Build the image with
#
#    rm -rf node_modules ; docker build . -t whimsy-board-agenda-dev
#
# And run with
#
#  rm -rf node_modules && docker run -it -v $PWD:/whimsy-board-agenda -p 3000:3000 whimsy-board-agenda-dev
#
# Optionally adding "bash" at the end to run a shell in that container, for 
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

# Run yarn install in a temporary folder that our start
# script can move before starting up. This container
# then runs on a local checkout, for development
# convenience.
RUN mkdir /yarn-install
COPY package.json /yarn-install
WORKDIR /yarn-install
RUN yarn install

COPY start-in-container.sh /
CMD bash -c "/start-in-container.sh"