#!/bin/bash
set -x

version=$1

#Function to setup harsco server
function server_setup {

    version=$1

    platform_dir=($(cd $(dirname $0) && pwd))

    #Function to place some config files & deploy scripts in correct locations
    function harsco_setup {

        #Create a directory for application & application logs
        mkdir -p $platform_dir/../../harsco-logs

        mkdir -p $platform_dir/../../mongodb

        #Replace defalut nginx config file with our application files.
        pushd $platform_dir/../configs
            ./harsco_setup.sh
        popd

        #Copying deploy scripts to home directory
        cp -r $platform_dir/auto_deploy.sh $platform_dir/../../
        cp -r $platform_dir/manual_deploy.sh $platform_dir/../../
        cp -r $platform_dir/mongodb_bkp.sh $platform_dir/../../

        #setup mongodb
        sudo mongod --dbpath /opt/harsco/mongodb
        sudo service mongod start
        use harsco

        #sudo env PATH=$PATH sl-pm-install --upstart=0.6
        #sudo /sbin/initctl start strong-pm
        #slc ctl create harsco-pk
        #slc ctl env-set harsco-pk NODE_ENV=production
        #slc ctl set-size harsco-pk 8

        sudo service nginx start
        sudo service awslogs start
        sudo chkconfig awslogs on
    }

    harsco_setup
}

export -f server_setup
su ec2-user -c "server_setup $version"
