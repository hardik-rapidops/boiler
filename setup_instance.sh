#!/bin/bash -ex

if [[ -z $ENVIRONMENT ]]; then
    echo "ENVIRONMENT variable (dev or prd) is required"
    exit -1
fi

cd $(dirname $0)
NODE_VER=16.20.2
export PATH=$PATH:$PWD/node_modules/.bin

function install_mongodb {
    sudo bash -c 'cat > /etc/yum.repos.d/mongodb-org-6.0.repo' <<END
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
END
    echo Installing mongodb...
    sudo yum install -q -e 0 -y mongodb-org

}

function install_storage {
    sudo mkfs -t xfs /dev/nvme1n1
    sudo mkdir -p /storage
    sudo bash -c "echo '/dev/nvme1n1 /storage xfs defaults,noatime 1 1' >> /etc/fstab"
    sudo mount -a
    test -d /storage
    sudo mkdir -p /storage/mongodb
    sudo chown mongod:root /storage/mongodb
}

function install_node {
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
    . ~/.nvm/nvm.sh
    nvm install ${NODE_VER}
    nvm use ${NODE_VER}
    node -v
    npm install -g forever #will install in ~/.nvm/versions/node/v10.13.0/bin/forever
}

function install_nginx {
    sudo amazon-linux-extras install -y nginx1.12
}

function install_forever {
    npm install -q -g forever
}

function setup_logrotate {
    sudo bash -c 'cat > /etc/logrotate.d/vensi-mongod' <<END
/var/log/mongodb/* {
  daily
  size 50M
  rotate 14
  missingok
  maxage 7
  notifempty
  create 0640 mongod mongod
  sharedscripts
  postrotate
    /bin/kill -SIGUSR1 `cat /var/run/mongodb/mongod.pid 2>/dev/null` >/dev/null 2>&1
  endscript
}
END

    sudo bash -c 'cat > /etc/logrotate.d/vensi-forever' <<END
/home/ec2-user/.forever/*.log {
  daily
  maxsize 6M
  rotate 14
  missingok
  copytruncate
  create 0644 ec2-user ec2-user
  nodelaycompress
  compress
  maxage 7
  notifempty
}
END
}


function setup_mongodb {
    #optimizations for mongodb
    sudo bash -c 'echo "mongod soft nproc 32000" >> /etc/security/limits.d/20-nproc.conf'
    sudo bash -c 'echo never > /sys/kernel/mm/transparent_hugepage/enabled'

    sudo rsync setup/configs/mongod.conf /etc/mongod.conf
}

function setup_nginx {
    mkdir -p nginx_logs/
    sudo mkdir -p /etc/nginx/conf.d
    sudo rsync setup/configs/nginx.conf /etc/nginx/nginx.conf
    sudo rsync setup/configs/virtual.conf /etc/nginx/conf.d/virtual.conf
}

function setup_cron_jobs {
    mkdir -p logs
    cat > /tmp/crontab <<END
33 */12 * * * /home/ec2-user/harsco/setup/deploy/mongodb_bkp.sh '$ENVIRONMENT' > /home/ec2-user/harsco/logs/db_backup.log 2>&1
45 3 * * * /home/ec2-user/harsco/run_pacman.sh '$ENVIRONMENT' > /home/ec2-user/harsco/logs/pacman.log 2>&1
*/5 * * * * /usr/bin/sudo /usr/bin/systemctl start mongod.service # Ensure mongod is running. It crashes with OOM sometimes
END
    crontab /tmp/crontab
}

function run_node_services {
    if [[ "$ENVIRONMENT" == "dev" ]]; then
        forever stopall
        sleep 2
        ENVIRONMENT=$ENVIRONMENT forever --minUptime 10000 --spinSleepTime 10000 start server/server.js
        # forever  --minUptime 10000 --spinSleepTime 10000 start bgtasks/pacman.js
        # ENVIRONMENT=$ENVIRONMENT forever --minUptime 10000 --spinSleepTime 10000 start bgtasks/aws-mongo-sync.js ${AWS_STACK_NAME}
        sleep 2
        forever list

    elif [[ "$ENVIRONMENT" == "prd" ]]; then
        echo "Running PRD services with PM2..."
        pm2 restart all
        pm2 save
        pm2 list

    else
        echo "Invalid ENVIRONMENT: $ENVIRONMENT"
        exit 1
    fi
}

echo Updating security...
sudo yum -q -e 0 -y update --security

#IMPORTANT: These are all conditionals. If you make any changes to config files,
# ensure to force it because it may not re-run on already installed instances!

if ! which mongod 2>/dev/null; then
    install_mongodb
fi

if ! grep nvme1n1 /etc/fstab ; then
    install_storage
fi

if ! node -v 2> /dev/null; then
    install_node
fi

if [[ $(nginx -v 2> /dev/null) != 'nginx version: nginx/1.12.2' ]]; then
    install_nginx
fi

setup_logrotate
setup_mongodb
setup_nginx
setup_cron_jobs

echo Restarting mongod...
sudo systemctl restart mongod.service
sudo systemctl restart nginx.service

echo Running services...
run_node_services
echo Done

# notes:
# /opt/aws/bin/cfn-signal maybe?
# rs.initiate({members:[{host:"172.31.71.198:27017"}]})
# aws s3 cp s3://harsco-backups.vensi.com/prd/pacmaned.gz /home/ec2-user/
# mongorestore --db harsco --gzip --archive=/home/ec2-user/pacmaned.gz
# mongo --quiet --eval 'rs.isMaster().primary == rs.isMaster().me'
# mongo --quiet --eval 'use harsco\n db.BoilerReadRecord.createIndex({boilerId:1, _id:1})'
# mongo --quiet --eval 'use harsco\n db.currentOp()'
