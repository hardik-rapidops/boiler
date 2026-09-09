const mongodb = require('mongodb');

function truncate(col, cutoffTs) {
    return new Promise(function (fulfill, reject) {
        const query = {
            receivedDate: {
                $lt: new Date(cutoffTs)
            }
        };
        console.log('Running truncator with query:', query);
        function resultHandler(err, data) {
            if (err) {
                console.error('accumulate error', err);
                return reject(err);
            }
            if (data && data.result) {
                console.log('Truncator:', data.result.n, 'document(s) deleted');
            } else {
                console.log('Data:', data);
            }
            fulfill();
        }


        if (module.exports.dryRun) {
            col.find(query, {}, function (err, cursor) {
                cursor.forEach(function (item) {
                    console.log('Removing:', item.receivedDate, item.boilerId);
                }, resultHandler);
            });
        } else {
            col.deleteMany(query, resultHandler);

        }
    });
}

module.exports.truncate = function (options) {
    return new Promise(function (fulfill, reject) {
        for (let f of ['url', 'dbName', 'collection', 'cutoffTs']) {
            if (typeof options[f] === 'undefined') {
                // noinspection ExceptionCaughtLocallyJS
                return reject('Field ' + f + ' is requierd');
            }
        }
        mongodb.connect(options.url, { useNewUrlParser: true }, function (err, client) {
            const col = client.db(options.dbName).collection(options.collection);
            return truncate(col, options.cutoffTs)
                .then(function () {
                    client.close();
                    fulfill();
                })
                .catch(function (err) {
                    console.error("Truncating error:", err);
                    return reject(err);
                })
        });
    });
};

module.exports.dryRun = false;
