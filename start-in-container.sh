#!/bin/bash
#
# startup script which picks up
# the node_modules folder prepared
# elsewhere by this container
#
cd /whimsy-board-agenda

# yarn --modules-folder should allow for pointing to that
# folder instead of moving it but I haven't found the right
# syntax for using it.
echo "Getting Node modules, this takes a bit of time due to Docker volume mount..."
mv /yarn-install/node_modules .

echo "Starting server..."
yarn dev
