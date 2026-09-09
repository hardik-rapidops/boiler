#!/bin/bash -e

cd $(dirname $0)

if [[ $(mongosh --quiet --eval 'rs.isMaster().primary == rs.isMaster().me') != "true" ]]; then
    echo '........................... Not running pacman on secondary.'
    exit 0
fi

source /home/ec2-user/.bashrc
node bgtasks/pacman.js
