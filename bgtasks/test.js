const mongodb = require('mongodb');

const URL = 'mongodb://localhost:27017/harsco';
const DB_NAME = 'harsco';

// x = {$and:[{"receivedDate":{"$lt":ISODate("2017-10-25T19:00:00.000Z")}},{"receivedDate":{"$gte":ISODate("2017-10-23T17:00:00.000Z")}} ]}
function test(options) {
    return new Promise(function (fulfill, reject) {
        try {
            mongodb.connect(options.url, {useNewUrlParser: true}, function (err, client) {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                const col = client.db(options.dbName).collection(options.collection);
                let x = 2;
                if (x === 0) {
                    col.find({
                        // 'receivedData.data.fuel'  : {$gt: 0},
                        boilerId: 'e76211d6-5847-404c-9050-5dd6e9d619f0',
                        receivedDate: {$gte: new Date('2018-10-01'),$lt: new Date('2019-10-02')}

                    }, {}, function (err, cursor) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        cursor.forEach(function (a) {
                            console.log(a.receivedDate, a.receivedData.data.fuel);
                        });

                    }, function (err) {
                        console.log("Done", err);
                    });
                } else if (x === 1) {
                    col.aggregate([
                        {
                            $match: {
                                // 'receivedData.data.fuel'  : {$gt: 0},
                                boilerId: 'e76211d6-5847-404c-9050-5dd6e9d619f0',
                                $and: [
                                    {receivedDate: {$gte: new Date(1527276300000)}},
                                    {receivedDate: {$lt: new Date(1527276300000 + 5 * 60 * 1000)}}
                                ],
                            },
                        },
                        {
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
                                                    5 * 60 * 1000
                                                ]
                                            }
                                        ]
                                    },
                                    boilerId: "$boilerId",
                                },
                                sumFuel: {$sum: '$receivedData.data.fuel'},
                                first: {$first: '$$ROOT'},
                            }
                        }
                    ], {}, function (err, cursor) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        cursor.forEach(function (a) {
                            const first = Object.assign({}, a.first);
                            first.receivedData.data.fuel = a.sumFuel;

                            console.log({id: a._id, sumFuel: a.sumFuel, first: JSON.stringify(first)});
                        });

                    }, function (err) {
                        console.log("Done", err);
                    });
                } else if (x === 2) {
                    col.find({}, {}, function (err, cursor) {
                        if (err) {
                            console.error(err);
                            return reject(err);
                        }
                        try {
                            cursor.forEach(function (a) {
                                console.log(JSON.stringify(a));
                            });
                        } catch (e) {
                            console.error(e);
                            reject(e);
                        }

                    }, function (err) {
                        console.log("Done", err);
                        return fulfill();
                    });
                }
            });
        } catch (e) {
            reject(e);
        }
    });

}

let COLLECTION_NAME;
let COMPACT_MINIMUM_AGE;
let TRUNCATE_MINIMUM_AGE;
const NOW_TS = Date.now();
const testing = false;
if (testing) {
    COMPACT_MINIMUM_AGE = NOW_TS - 5 * 60 * 1000; // 5 minutes
    TRUNCATE_MINIMUM_AGE = NOW_TS - 7 * 60 * 1000; // 7 minutes
    COLLECTION_NAME = 'TestData';
} else {
    COMPACT_MINIMUM_AGE = NOW_TS - 365 * 24 * 60 * 60 * 1000; // 32 days
    TRUNCATE_MINIMUM_AGE = NOW_TS - 367 * 24 * 60 * 60 * 1000; // 1 y
    COLLECTION_NAME = 'BoilerReadRecord';
}

test({
    url: URL,
    dbName: DB_NAME,
    collection: COLLECTION_NAME,
    minimumAge: COMPACT_MINIMUM_AGE,
    maximumAge: TRUNCATE_MINIMUM_AGE,
}, DB_NAME).then(function () {
    console.log('Done')
}).catch(function (err) {
    console.error(err);
});