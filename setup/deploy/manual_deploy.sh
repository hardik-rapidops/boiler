#!/bin/bash
set -x

platform_dir=($(cd $(dirname $0) && pwd))
version=$1

mkdir -p /opt/harsco/harsco-logs
touch /opt/harsco/harsco-logs/upgrade.log

# Removing the old files #
echo "Removing the old files" >> /opt/harsco/harsco-logs/upgrade.log
rm -rf arc-manager.json client common definitions fileupload.html node_modules package.json README.md server setup 
# Removing the old files #

if [ -f $platform_dir/harsco.tar.gz ]; then
    rm -rf harsco_bkp.tar.gz
    mv harsco.tar.gz harsco_bkp.tar.gz
fi

aws s3api get-object --bucket harscopk-data --key release/$version/harsco.tar.gz harsco.tar.gz
tar -xvf harsco.tar.gz >> /opt/harsco/harsco-logs/upgrade.log
echo "______________last updated at:$(date)____________________" >> /opt/harsco/harsco-logs/upgrade.log

#build server is not building the node modules, so we are building here.
npm prune
npm install

# copying the cordova files #
if [ -d $platform_dir/cordova ]; then
	if [ ! -d $platform_dir/client/platforms/browser/www/cordova ]; then
  		mkdir -p $platform_dir/client/platforms/browser/www/cordova
	fi
	echo "Restoring the cordova files" >> /opt/harsco/harsco-logs/upgrade.log
	cp -rf $platform_dir/cordova/* $platform_dir/client/platforms/browser/www/cordova/
fi
# copying the cordova files #

pushd $platform_dir/setup/deploy
      ./starter.sh >> /opt/harsco/harsco-logs/upgrade.log
popd

