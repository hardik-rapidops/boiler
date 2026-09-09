db.BoilerReadRecord.find({
    "boilerId": "004759b4-b694-477c-96cd-c3cc4d26e45e",
    "receivedDate": {"$gte": ISODate("2017-07-01T00:00:00Z"), "$lt": ISODate("2017-07-22T00:00:00Z")}
}).forEach(function (record) {
    str = tojson(record);
    print(str);
})

Boiler 1 = 004759b4-b694-477c-96cd-c3cc4d26e45e
Boiler 2 = c9208732-3962-40a8-b6e7-b51d322746b1
Boiler 3 = c29d8997-27ef-4a77-9a15-c2621383e73b

mongoexport -d harsco -c BoilerReadRecord -q '{"boilerId": "c29d8997-27ef-4a77-9a15-c2621383e73b","receivedDate": {"$gte": ISODate("2017-07-01T00:00:00Z"), "$lt": ISODate("2017-07-23T00:00:00Z")}
}' --out ~/BoilerRecords.json