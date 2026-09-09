#!/usr/bin/env bash
set -e
set -x
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

export PATH=$PATH:/usr/local/bin

#defaults
export BITBUCKET_BUILD_NUMBER=${BITBUCKET_BUILD_NUMBER-000} # set to 000 if not set
SSH_SERVER=
SSH_PORT=2222
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
    --ssh-server)
      #implies nobuild and no prepare
      DO_BUILD=no
      DO_PREPARE=no
      SSH_SERVER=$1
      shift
      ;;
    --ssh-port)
      SSH_PORT=$1
      shift
      ;;
    --key)
      SSH_KEY_ARGS="-i $1"
      shift
      ;;
    *)    # unknown option
      echo Unknown option $key
      exit -1
      ;;
  esac
done

if [[ ! -d www ]]; then
  echo run build_www.sh first!
  exit -1
fi

if [[ $DO_PREPARE == "yes" ]]; then
  if [[ ! -d www ]]; then
    echo run build_www.sh first!
    exit -1
  fi
  cordova prepare ios --browserify --fetch
fi

if [[ $DO_BUILD == "yes" ]]; then
  # then do the actual build....
  bundle install --path tmp/bundle
  bundle exec fastlane add_plugin badge
  bundle exec fastlane add_plugin cordova
  #execute ios beta only if not running remotely
  bundle exec fastlane ios beta
fi

if [[ -n $SSH_SERVER ]]; then
  # example: SSH_SERVER=adershjames@52.87.62.208
  SSH_MAC="ssh -o StrictHostKeyChecking=no -p $SSH_PORT $SSH_KEY_ARGS $SSH_SERVER"
  SCP_MAC="scp -o StrictHostKeyChecking=no -P $SSH_PORT $SSH_KEY_ARGS"

  pid=$$

  echo My ip is $(curl -s ifconfig.co)

  # Private key is BB pipeline Vensi settings environment variable
  if [[ -n $SSH_OFFICE_PEM ]]; then
    (umask  077 ; echo $SSH_OFFICE_PEM | base64 --decode > ~/.ssh/id_rsa)
  fi

  $SSH_MAC rm -rf /build/harsco
  $SSH_MAC mkdir -p /build/harsco/platforms

  # only copy shell scripts
  $SCP_MAC -r res/ Gem* fastlane/ *.sh *.xml *.json www $SSH_SERVER:/build/harsco
  $SSH_MAC /build/harsco/build_ios.sh --build-number $BITBUCKET_BUILD_NUMBER
  $SSH_MAC rm -rf /build/harsco
fi

