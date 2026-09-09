#!/bin/sh

platform_dir=($(cd $(dirname $0) && pwd))
forever stopall

#deleting the old node server logs
rm ~/.forever/*.log

#deleting nginx cache files
if [ -d /tmp/nginx_cache ]; then
   sudo rm -rf /tmp/nginx_cache
fi

if [ $(ps -e -o uid,cmd | grep $UID | grep node | grep -v grep | wc -l | tr -s "\n") -eq 0 ]
then
    export PATH=/usr/local/bin:$PATH
    PORT=3030 DBPORT=27017 forever start $platform_dir/../../server/server.js #harsco server
#   PORT=3031 DBPORT=27018 forever start $platform_dir/../../server/server.js #harsco server not for prod
fi

sudo service nginx restart
