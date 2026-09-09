#!/usr/bin/env bash
set -e
set -x

export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

cd $(dirname $0)

if [[ -d /hooks ]]; then
  # in docker container
  cp -r /hooks/. hooks/
fi

DO_BUILD=yes
DO_PREPARE=yes

cd $(dirname $0)

while [[ $# -gt 0 ]]; do
  key="$1"
  shift
  case $key in
    --build-number)
      BITBUCKET_BUILD_NUMBER=$1
      shift
      ;;
    --no-build)
      DO_BUILD=no
      ;;
    --no-prepare)
      DO_PREPARE=no
      ;;
    *)    # unknown option
      echo Unknown option $key
      exit -1
      ;;
  esac
done


if [[ $DO_PREPARE == "yes" ]]; then
  if [[ ! -d www ]]; then
    echo run build_www.sh first!
    exit -1
  fi
  cordova prepare android --browserify --fetch --verbose

  # hack for fabric not being compatible with 6.3.0
  # sed -i "s#io\.fabric\.tools.*#io.fabric.tools:gradle:1.27.1\'#" platforms/android/build.gradle
  # sed -i '/debugCompile/d' platforms/android/cordova-plugin-background-app/app-background-activity-lib/build.gradle
  # sed -i "s#releaseCompile.*#implementation project(\':CordovaLib\')#" platforms/android/cordova-plugin-background-app/app-background-activity-lib/build.gradle
fi

if [[ $DO_BUILD == "yes" ]]; then
  bundle install
  bundle exec fastlane add_plugin badge
  bundle exec fastlane add_plugin cordova
  bundle exec fastlane android beta
fi


