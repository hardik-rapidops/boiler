Todo:
* ~~Kranti to get transfer certificate for ALB?~~
* ~~Check performance on full db backup~~
* ~~Test that logrotate works~~
* ~~Figure out how to run backup DB on multiple instances so they don't collide.~~
* ~~Schedule DB backup~~
* ~~Verify that backups work~~
* ~~Check if pacman can work~~
* ~~Ensure that pacman can work subsequently~~
* ~~Check for missing icon~~
* ~~Fix WARNING: soft rlimits too low. rlimits set to 4096 processes, 64000 files. Number of processes should be at least 32000 : 0.5 times number of files.~~
* ~~Check that cfn-hup works on startup~~
* ~~Merge to main branch~~
* ~~Shrink to one AZ~~
* ~~Kill dev instance in nediso account~~

 Deployment Steps:

* Start with one instance
* Manualy remove the instance from ELB

```
sudo mv /etc/cron.daily/logrotate /etc/cron.hourly/ # logs to be cleaned up faster
crontab -e # remove the crontab line
mkdir -p ~/.aws/
vi ~/.aws/credentials
aws s3 cp s3://harscopk-data/release/PRD_00/mongo_bkp/harscodb_20181129xx.gz .
rm -rf ~/.aws/
ifconfig
mongo
use harsco
db.dropDatabase() or rs.initiate()
#fix the hostname for the member:
cfg = rs.conf()
cfg.members[0].host="<privateip>:27017"
cfg.members[0].priority=2
rs.reconfig(cfg)
time mongorestore --db harsco --gzip --archive=harscodb_20181129xx.gz # 40 minutes
rm -f harscodb_20181129xx.gz
```

* Expand num instances to 2 and Wait for rs.status()
* Wait some time for crontab to update and delete the schedule again

```
##### vi client/www/scripts/app-18450e2adf.js and replace trending() near <span class="menu-title">Trending</span> with void() and remove ui-sref tag;
mongo
use harsco
db.ACL.createIndex({model: 1, property:1, accessType:1})
cd harsco
forever start bgtasks/pacman.js # 2 hours+
grep 'Query.*gte' /home/ec2-user/.forever/*.log # check progress
tail /home/ec2-user/.forever/*.log # confirm done
```

* Wait for pacman to complete

```
db.BoilerReadRecord.createIndex({receivedDate: 1, boilerId:1})
db.BoilerReadRecord.createIndex({boilerId:1})
```

* Expand num instances to 3
* Wait for rs.status() Terminate the working instance after some time
* After verification is done, modify pacman.js to include a relaxed compactor time and upload to deployment directory

Should:

* ~~Find out why logs are filling up disk space~~
* Figure out why spam on primary Error in heartbeat (requestId: 21366) to 172.31.84.69:27017, but that server is not in the set!

Later:

* Nik to terminate dev and prod instances on nediso account 
* ~~Automated deployment to new bucket~~
* Remove nodemailer creds at mails.js. Need to use instance profile.
* Kranti to set up SES on aws account so we can do the above.
* Ship cloudwatch logs.
* Optimize further with more indexes
* ~~Figure out how to read from secondary~~
* ~~Test 11/05/2018 to 11/09/2018 1,224.89 therms on master dev, vs 1,165.14 therms~~
* Setup backups: dev 10 days, prd 90 days.
* See if instances are up.