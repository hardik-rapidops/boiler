#!/bin/bash
set -x

sudo yum -y update
sudo yum -y install gcc-c++ make
sudo yum -y install openssl-devel
sudo yum -y install git
sudo yum -y install nginx
sudo yum -y install awscli
sudo yum -y install awslogs
#todo: setup the logs properly into cloudwatch

#Function to setup harsco server
function server_setup {

    platform_dir=($(cd $(dirname $0) && pwd))
    set -x
    node_ver=v6.0.0
    node_name=node-$node_ver-linux-x64

    #Function to setup node
    function node_setup {
    pushd /tmp
        wget https://nodejs.org/dist/$node_ver/$node_name.tar.gz -q
        pushd /opt
          sudo tar -zxvf /tmp/$node_name.tar.gz
          sudo ln -s /opt/$node_name/bin/node /usr/local/bin/
          sudo ln -s /opt/$node_name/bin/npm /usr/local/bin/
          sudo ln -s /usr/local/bin/node /usr/bin/node
          sudo ln -s /usr/local/lib/node /usr/lib/node
          sudo ln -s /usr/local/bin/npm /usr/bin/npm
          sudo npm install -g forever
          sudo ln -s /opt/$node_name/bin/forever /usr/local/bin/
          sudo npm install -g strongloop
          sudo ln -s /opt/$node_name/bin/slc /usr/local/bin/
          sudo npm install -g strong-pm --unsafe-perm
          sudo ln -s /opt/$node_name/bin/slpm /usr/local/bin/
          sudo ln -s /opt/$node_name/bin/sl-pm /usr/local/bin/
          sudo ln -s /opt/$node_name/bin/slpmctl /usr/local/bin/
          sudo ln -s /opt/$node_name/bin/sl-pmctl /usr/local/bin/
          sudo ln -s /opt/$node_name/bin/sl-pm-install /usr/local/bin/
        popd
        sudo rm -rf $node_name.tar.gz
    popd
    }

    #Function to setup mongo db
    function mongo_setup {
        sudo tee /etc/yum.repos.d/mongodb-org-3.4.repo <<EOF
[mongodb-org-3.4]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2013.03/mongodb-org/3.4/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-3.4.asc
EOF
        sudo yum install -y mongodb-org
    }
             
    node_setup
    mongo_setup
}

export -f server_setup
su ec2-user -c "server_setup"
