#!/bin/bash
set -x
platform_dir=($(cd $(dirname $0) && pwd))

mkdir -p ~/nginx_backup

sudo mv /etc/nginx/nginx.conf ~/nginx_backup/
sudo mv $platform_dir/nginx.conf /etc/nginx/

sudo mv /etc/nginx/conf.d/virtual.conf ~/nginx_backup/
sudo mv $platform_dir/virtual.conf /etc/nginx/conf.d/
