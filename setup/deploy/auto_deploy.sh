#!/bin/bash
set -x
version=$1
platform_dir=($(cd $(dirname $0) && pwd))

aws s3api head-object --bucket harscopk-data --key release/$version/harsco.tar.gz > $platform_dir/harsco-logs/metadata
data=$(grep ETag $platform_dir/harsco-logs/metadata)
data=${data#*:}
oldtag=${data:4:32}
while true
do
    aws s3api head-object --bucket harscopk-data --key release/$version/harsco.tar.gz > $platform_dir/harsco-logs/metadata
    data=$(grep ETag $platform_dir/harsco-logs/metadata)
    data=${data#*:}
    newtag=${data:4:32}
        if [ "$oldtag" != "$newtag" ]
        then
            rm -rf $platform_dir/harsco-logs/upgrade.log
            echo "Modification found in s3 bucket" >> $platform_dir/harsco-logs/upgrade.log
            echo "oldtag=$oldtag newtag=$newtag" >> $platform_dir/harsco-logs/upgrade.log
            echo "______________updated at:$(date)____________________" >> $platform_dir/harsco-logs/upgrade.log

            ./manual_deploy.sh $version

            oldtag=$newtag
        fi
    sleep 180
done

