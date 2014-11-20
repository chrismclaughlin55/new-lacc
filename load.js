var mongodb = require('mongodb');

mongodb.MongoClient.connect("mongodb://localhost:27017/lacc", function(err,db) {
    console.log("wow");
    //var entries = require('./load.json');
    var entries = require('./load.json');

    db.dropDatabase();
    entries.forEach(function(e) {
        var entry = {};
        entry.name = e.name;
        entry.narrative = '';
        entry.address = '';
        entry.category = e.category;
        entry.lat = e.lat;
        entry.lng = e.lng;
        entry.user_values = {
            "Year Completed": e.year,
            "Sponsors": e.sponsors
        };
        db.collection('projects').insert(entry, function(err, records) {
            console.log("Record added");
        });
    });
    console.log("Done");
    return;
});
