#!/bin/bash
#
# startup script which picks up
# the node_modules folder prepared
# elsewhere by this container
#
cd /whimsy-board-agenda

echo "Getting Node modules, this takes a bit of time due to Docker volume mount..."
mv /yarn-install/node_modules .

echo "Starting server..."
yarn dev
