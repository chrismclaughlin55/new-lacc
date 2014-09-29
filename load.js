var mongodb = require('mongodb');

mongodb.MongoClient.connect("mongodb://localhost:27017/lacc", function(err,db) {
    var entries = require('./load.json');
    entries.forEach(function(e) {
        var entry = {};
        entry.name = e.name;
        entry.narrative = '';
        entry.address = '';
        entry.category = e.category;
        entry.coords = {
            point: {
                lat: e.lat,
                lng: e.lng
            }
        };
        entry.user_values = {
            "Year Completed": e.year,
            "Sponsors": e.sponsors
        };
        db.dropDatabase();
        db.collection('mapData').insert(entry, function(err, records) {
            console.log("Record added");
        });
    });
    console.log("Done");
});
