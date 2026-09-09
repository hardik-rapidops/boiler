const mongodb = require('mongodb');

const URL = 'mongodb://localhost:27017/harsco';
const DB_NAME = 'harsco';

// x = {$and:[{"receivedDate":{"$lt":ISODate("2017-10-25T19:00:00.000Z")}},{"receivedDate":{"$gte":ISODate("2017-10-23T17:00:00.000Z")}} ]}
async function test(options) {
    try {
        const client = await mongodb.connect(options.url, {useNewUrlParser: true});
        const col = client.db(options.dbName).collection(options.collection);
        console.log('DB Ok');
        let cursor = await col.aggregate([
            {
                $match: {
                    // 'receivedData.data.fuel'  : {$gt: 0},
                    boilerId: 'fb4f5675-424d-4b2c-8754-3e89ccfc30a4',
                    receivedDate: {$gte: new Date('2018-11-05'),$lt: new Date('2018-11-09')}
                },
            },
            {
                $group: {
                    _id: null,
                    cnt: {$sum: 1},
                    sumFuel: {$sum: '$receivedData.data.fuel'},
                }
            }
        ]);
        console.log('got cursor');
        const result = await cursor.toArray();
        console.log(result);
        return Promise.resolve();

    } catch (e) {
        console.error(e);
        return Promise.reject(e);
    }
}
test({
    url: URL,
    dbName: DB_NAME,
    collection: 'BoilerReadRecord'
}, DB_NAME).then(function () {
    console.log('Done')
}).catch(function (err) {
    console.error(err);
});