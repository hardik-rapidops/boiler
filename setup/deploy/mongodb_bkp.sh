#!/bin/bash -xe

env=$1
backup_file=harscodb_"$(date +'%Y%m%d-%H')".gz

if [[ -z $env ]]; then
    echo 'BACKUP FAILED: Missing argument "env"!'
    exit 1
fi

# Skip backup on primary
if [[ $(mongosh --quiet --eval 'db.isMaster().ismaster') == "true" ]]; then
    echo 'Skipping backup on PRIMARY node.'
    exit 0
fi

echo "Starting streaming backup: $(date)"

sudo nice -n 19 mongodump --db harsco --archive | \
gzip | \
sudo -i -u ec2-user aws s3 cp - \
s3://harsco-backups.vensi.com/$env/$backup_file

echo "Backup completed successfully" 