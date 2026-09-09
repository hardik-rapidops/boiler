const AWS = require('aws-sdk');

const  UPDATE_INTERVAL_MS = 30000;
const PORT = ':27017';
const MongoClient = require('mongodb').MongoClient;

AWS.config.update({region: 'us-east-1'});
if (process.env.UNIT_TEST && process.env.USER !== 'ec2-user') {
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: 'harsco'});
}

// Create EC2 service object
const cf = new AWS.CloudFormation({apiVersion: '2010-05-15'});
const as = new AWS.AutoScaling({apiVersion: '2011-01-01'});
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

async function analyzeInstances(instanceIds) {
    try {
        const params = {
            InstanceIds: instanceIds
        };
        const data = await ec2.describeInstances(params).promise();
        const ec2Ips = [];
        if (data.Reservations && data.Reservations.length > 0) {
            for (let rid = 0; rid < data.Reservations.length; rid++) {
                if (data.Reservations[rid].Instances) {
                    const reqInstances = data.Reservations[rid].Instances;
                    for (let iid = 0; iid < reqInstances.length; iid++) {
                        const instance = reqInstances[iid];
                        if (instance.InstanceId && instance.NetworkInterfaces && instance.NetworkInterfaces.length > 0) {
                            ec2Ips.push(instance.NetworkInterfaces[0].PrivateIpAddress);
                        }
                    }
                }
            }
        }
        console.log('EC2 IPs', ec2Ips);
        return Promise.resolve(ec2Ips);
    } catch (e) {
        return Promise.reject('ERROR analyzeInstances: ' + e);
    }
}

async function analyzeAutoScalingGroup(asGroupName) {
    try {
        const params = {
            AutoScalingGroupNames: [asGroupName]
        };
        const data = await as.describeAutoScalingGroups(params).promise();
        // const data = await as.describeAutoScalingGroups(params).promise();
        if (data.AutoScalingGroups.length !== 1) {
            return Promise.reject('Unable to describe autoscaling group. Length was data.AutoScalingGroups.length')
        }
        const asg = data.AutoScalingGroups[0];
        if (asg.Instances.length > 0) {
            const instanceIds = [];
            for (let i = 0; i < asg.Instances.length; i++) {
                const instance = asg.Instances[i];
                if (instance.HealthStatus === 'Healthy') {
                    instanceIds.push(instance.InstanceId);
                }
            }
            return Promise.resolve(analyzeInstances(instanceIds));
        } else {
            console.warn('Autoscaling instances are missing???');
            return Promise.resolve([]);
        }
    } catch (e) {
        return Promise.reject('ERROR analyzeAutoScalingGroup: ' + e);
    }
}

async function describeStackInstances(stackName) {
    try {
        const params = {
            StackName: stackName
        };
        const data = await cf.listStackResources(params).promise();
        if (data.StackResourceSummaries && data.StackResourceSummaries.length) {
            for (let i = 0; i < data.StackResourceSummaries.length; i++) {
                const resource = data.StackResourceSummaries[i];
                if (resource && resource.ResourceType && resource.ResourceType === 'AWS::AutoScaling::AutoScalingGroup') {
                    return Promise.resolve(analyzeAutoScalingGroup(resource.PhysicalResourceId));
                }
            }
        }
        return Promise.reject('Missing autoscaling group in stack?')
    } catch (e) {
        return Promise.reject('ERROR describeStackInstances: ' + e);
    }
}


async function getMasterDb() {
    let client = null;
    try {
         client = await MongoClient.connect('mongodb://localhost:27017/harsco?replicaSet=rs0', {useNewUrlParser: true});
        const db = client.db('harsco');
        const data = await db.executeDbAdminCommand({isMaster: 1});
        if (data.ismaster !== true) {
            client.close();
            return Promise.resolve(null);
        }
        else {
            return Promise.resolve({client: client, db: db});
        }
    } catch (e) {
        if (client) {
            client.close();
        }
        return Promise.reject('getMasterDb Error: ' + e);
    }
}

async function removeMember(db, member) {
    try {
        const result = await db.executeDbAdminCommand({replSetGetConfig: 1})
        const m = result.config.members;
        let found = false;
        for (let i = 0; i < m.length; i++) {
            if (m[i].host === member) {
                m.splice(i, 1);
                result.config.version++;
                return db.executeDbAdminCommand({replSetReconfig: result.config});
            }
        }
        if (!found) {
            return Promise.reject('Member ' + member + ' not found in members: ' + JSON.stringify(m));
        }
    } catch (e) {
        return Promise.reject('removeMember Error: ' + e);
    }
}


async function addMember(db, member) {
    function getFreeId(ids) {
        ids.sort();
        let insertId = ids.length;
        for (let i = 0; i < ids.length; i++) {
            if (ids[i] !== i) {
                insertId = i;
                break;
            }
        }
        return insertId;
    }

    try {
        const result = await db.executeDbAdminCommand({replSetGetConfig: 1});
        const m = result.config.members;
        const ids = [];
        for (let i = 0; i < m.length; i++) {
            const member = m[i];
            ids.push(member._id);
        }
        const id = getFreeId(ids);
        m.push({
            _id: id,
            host: member
        });
        result.config.version++;
        return db.executeDbAdminCommand({replSetReconfig: result.config});
    } catch (e) {
        return Promise.reject('addMember Error: ' + e);
    }
}

async function getReplicaData(db) {
    try {
        const data = await db.executeDbAdminCommand({replSetGetStatus: 1});
        const mongoIps = [];
        for (let i = 0; i < data.members.length; i++) {
            mongoIps.push(data.members[i].name)
        }
        console.log('RS Members', mongoIps);
        return Promise.resolve(mongoIps);
    } catch (e) {
        return Promise.reject(e);
    }
}


async function main(stackName) {
    let client = null;
    try {
        const ec2Ips = await describeStackInstances(stackName);
        const result = await getMasterDb();

        if (!result.db) {
            console.log('Not master database. Not running now...');
            return;
        }
        client = result.client;
        const db = result.db;
        const mongoIps = await getReplicaData(db);
        //const ec2Ips = await describeStackInstances(stackName);
        let membersToRemove;
        const membersToAdd = [];
        const membersToRemoveMap = {};

        // assume everyone needs to be removed;
        for (let i = 0; i < mongoIps.length; i++) {
            membersToRemoveMap[mongoIps[i]] = true;
        }

        for (let i = 0; i < ec2Ips.length; i++) {
            if (membersToRemoveMap[ec2Ips[i] + PORT]) {
                // instance found in replica set. Don't remove it.
                delete membersToRemoveMap[ec2Ips[i] + PORT];
            } else {
                // instance not in replica set, append it to members to add;
                membersToAdd.push(ec2Ips[i] + PORT);
            }
        }
        membersToRemove = Object.keys(membersToRemoveMap);
        if (membersToRemove.length === 0 && membersToAdd.length === 0) {
            console.log('Stack is up to date');
            client.close();
            client = null;
            return;
        }

        console.log('Adding:', membersToAdd);
        console.log('Removing:', membersToRemove);

        for (let i = 0; i < membersToAdd.length; i++) {
            try {
                console.log('Adding', membersToAdd[i]);
                await addMember(db, membersToAdd[i]);
            } catch (e) {
                console.error('Member Add Error', e);
            }
        }
        for (let i = 0; i < membersToRemove.length; i++) {
            try {
                console.log('Removing', membersToRemove[i]);
                await removeMember(db, membersToRemove[i]);
            } catch (e) {
                console.error('Member Remove Error', e);

            }
        }
    } catch (e) {
        console.error('ERROR:', e);
    }

    if (client) {
        client.close();
    }
}

if (process.argv.length > 2) {
    main(process.argv[2]);
    setInterval(function () {
        main(process.argv[2]);
    }, UPDATE_INTERVAL_MS);
} else if (process.env['UNIT_TEST']) {
    main('prd');
} else {
    console.log('Nothing to do. Did you pass process args??');
    process.exit(-1);
}


