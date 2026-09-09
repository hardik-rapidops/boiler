var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSet;

    // var db = new Db('harsco', new Server('localhost', 27017));
var servers = [
    new Server('172.31.32.73', 27017),
    new Server('172.31.40.163', 27017),
    new Server('172.31.39.3', 27017),
];

var db = new Db('harsco', new ReplSetServers(
    servers,
    {
        replicaSet: 'rs0'
    }
));

var DB = function () {

};

DB.insert = function (table, data, cb) {
    db.open(function (err, db) {
        db.collection(table, function (err, collection) {

            // Insert a bunch of documents
            collection.insert(
                data, function (err, result) {

                    if (err) {
                        cb(err);
                    }

                    console.log("INSERTING TO MONGO DB");
                    cb(err, result);
                    console.log("DONE INSERTING");
                   // db.close();
                }
            );
        });
    });
};

DB.selectFew = function (table, conditions, cb) {
    console.log("SELECT FEW " + table);
    db.open(function (err, db) {
        if (err) cb(err);
        var cursor = db.collection(table).find(conditions);
        var records = [];
        cursor.each(function (err, record) {

            if (record != null) records.push(record);
            else {
                // db.close();
                cb(null, records);
            }
        });

    })
};

DB.update = function (table, where, update, cb) {
    db.open(function (err, db) {
        if (err) cb(err);
        db.collection(table).update(where, update, function (err,res) {
            // db.close();
            cb(err,res);
        });

    })
};

module.exports = DB;
