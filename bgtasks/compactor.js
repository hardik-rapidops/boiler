const mongodb = require('mongodb');

function deleteEntries(col, keys) {
    return new Promise(function (fulfill, reject) {
        if (module.exports.dryRun) {
            console.log('DRY RUN', JSON.stringify(keys));
            return fulfill();
        }
        col.deleteMany({
            _id: {
                $in: keys.map(function (key) {
                    return mongodb.ObjectID(key);
                })
            }
        }, {}, function (err, data) {
            if (err) {
                console.error('deleteEntries error:', err);
                return reject('Failed to delete all keys keys');
            } else if (data.result.n !== keys.length) {
                console.error('deleteEntries error:', err);
                return reject('Did not delete all keys');
            } else {
                // console.log("--- deleted ", keys.length);
                return fulfill(err);
            }
        });
    });
}

function updateRecord(col, item) {
    return new Promise(function (fulfill, reject) {
        if (module.exports.dryRun) {
            console.log('DRY RUN', JSON.stringify(item));
            return fulfill();
        }
        col.updateOne({_id: item._id}, {
            $set: {
                'receivedData.data.fuel' : item.receivedData.data.fuel,
                aggregation : 'v1.0._5min'
            }
        }, function (err, data) {
            if (err) {
                console.error('updateRecord error:', err);
                return reject(err);
            } else {
                if (data.modifiedCount !== 1) {
                    return reject('Failed to update record ' + JSON.stringify(item));
                }
                // console.log("+++ updated ", item._id);
                return fulfill(err);
            }
        });
    });
}

// {receivedDate:{$gte: ISODate('2017-12-01 05:10:01.107'), $lte: ISODate('2017-12-01 05:15:01.107')} , boilerId:"6d0ec042-70b8-4deb-a42c-3c3778ea7d50"}
//
// {receivedDate:{$gte: ISODate('2017-12-01 05:10:01.107'), $lt: ISODate('2017-12-01 05:20:01.107')} }
// {receivedDate : {$and:[$gt: ISODate('2018-05-05 18:35:00.000'), $lt: ISODate('2018-05-05 18:35:10.640')] }}

function accumulate(col, interval, oldTs, youngTs) {
    let result = {
        skipped: 0,
        errors: 0,
        blocks: 0,
        deleted: 0
    };
    let pendingCount = 0;

    const groupQuery = {
        $group: {
            _id: {
                time: {
                    $subtract: [
                        {
                            $subtract: ["$receivedDate", new Date(0)]
                        },
                        {
                            $mod: [
                                {$subtract: ["$receivedDate", new Date(0)]},
                                interval
                            ]
                        }
                    ]
                },
                boilerId: "$boilerId",
            },
            aggCount: {$sum: {$cond: [{$ifNull: ["$aggregation", false]}, 1, 0]}},
            first: {$first: '$$ROOT'},
            keys: {$push: '$_id'},
            // about cond below not needed for now because of aggCount check, but extra caution in case we need to reprocess
            sumFuel: {$sum: '$receivedData.data.fuel'}
        },
    };


    function aggregateBatch(from, to) {
        let q = [
            {
                $match: {
                    // receivedDate:{$gte: new Date('2017-12-01 05:10:01.107'), $lt: new Date('2017-12-01 05:20:01.107')}
                    receivedDate: {$gte: new Date(from), $lt: new Date(to)},
                }
            },
            groupQuery,

        ];
        return new Promise(function (fulfill, reject) {
            console.log('Query:', JSON.stringify(q));
            console.log('Match:', JSON.stringify(q[0].$match).replace(/"20/g, 'ISODate("20').replace(/00Z"/g, '00Z")'));
            col.aggregate(q, {allowDiskUse: true}, function (err, cursor) {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                cursor.forEach(function (a) {
                    if (a.aggCount === 1) {
                        if (a.keys && a.keys.length > 1) {
                            console.error('DATA ERROR (accumulate): ', a.keys.length - 1, 'unprocessed records near', a._id);
                            result.errors++;
                        } else {
                            // console.log('Already processed', a._id.time, a.first.receivedDate);
                            result.skipped++;
                        }
                        return;
                    } else if (a.aggCount > 1) {
                        console.error('Query returned more than one aggregation count for time', new Date(a._id.time));
                        result.errors++;
                    } else if (!a.keys || a.keys.length === 0) {
                        console.error('DATA ERROR (accumulate): No keys?', a.keys);
                        result.errors++;
                        return;
                    }
                    // remove the first entry which we will update with averages
                    a.keys.shift();

                    // construct the updated item
                    const first = Object.assign({}, a.first);
                    first.aggregation = 'v1.0._5min';
                    if (!first.receivedData || !first.receivedData.data) {
                        console.error('DATA ERROR (accumulate): Reference record missing received data!', JSON.stringify(first));
                        result.errors++;
                        return;
                    }
                    first.receivedData.data.fuel = a.sumFuel;

                    pendingCount++;
                    result.blocks++;
                    updateRecord(col, first)
                        .then(function () {
                            return deleteEntries(col, a.keys)
                                .then(function () {
                                    pendingCount--;

                                })
                                .catch(function (err) {
                                    pendingCount--;
                                    result.deleted += a.keys.length;
                                    result.errors++;
                                    console.error('DATA ERROR (delete):', err);
                                })
                        })
                        .catch(function (err) {
                            pendingCount--;
                            result.errors++;
                            console.error('DATA ERROR (update):', err);
                        })
                    ;
                }, function (err) {
                    if (err) {
                        console.error('FATAL ERROR (accumulate)', err);
                    }
                    console.log('Done');
                    const checkInterval = setInterval(function () {
                        if (pendingCount === 0) {
                            clearTimeout(checkInterval);
                            fulfill(result);
                        }
                    }, 1000);
                })
            })
        });
    }


    const BATCH_OFFSET = interval * 10000; // about a week by default
    let ret = Promise.resolve(result);
    console.log('Running compactor from', new Date(oldTs), 'to', new Date(youngTs));
    while (oldTs < youngTs) {
        const from = oldTs;
        let to = (oldTs + BATCH_OFFSET); // no need to mod with interval because timestamps are gonna be aligned with it anyways
        if (oldTs + BATCH_OFFSET > youngTs) {
            // last batch
            to = youngTs;
        }

        ret = ret.then(function () {
            console.log('Aggregate from', new Date(from), 'to', new Date(to));
            return aggregateBatch(from, to)
        });
        oldTs += BATCH_OFFSET;
    }
    return ret.then(function () {
        return aggregateBatch(oldTs, youngTs);
    });
}

module.exports.compact = function (_options) {
    const options = Object.assign({}, _options);
    return new Promise(function (fulfill, reject) {
        try {
            for (let f of ['url', 'dbName', 'collection', 'interval', 'oldTs', 'youngTs']) {
                if (typeof options[f] === 'undefined') {
                    // noinspection ExceptionCaughtLocallyJS
                    return reject('Field ' + f + ' is requierd');
                }
            }
            // make sure min and max age fall onto an interval to avoid to average a partial interval
            // make sure that filter gte/lt falls right
            options.oldTs -= options.oldTs % options.interval;
            options.youngTs -= options.youngTs % options.interval;
            mongodb.connect(options.url, {useNewUrlParser: true}, function (err, client) {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                const col = client.db(options.dbName).collection(options.collection);
                return accumulate(col, options.interval, options.oldTs, options.youngTs)
                    .then(function (result) {
                        client.close();
                        fulfill(result);
                    })
                    .catch(function (err) {
                        console.error("Compacting error:", err);
                        reject(err);
                    })
            });
        } catch (e) {
            reject(e);
        }
    });
};
module.exports.dryRun = false;
