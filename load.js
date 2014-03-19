var mongodb = require('mongodb');
var mongoose = require('mongoose');
var Project = require('./models/Project');
var Category = require('./models/Category');


mongodb.MongoClient.connect("mongodb://localhost:27017/lacc", function(err,db) {
    var entries = require('./load.json');
            var Project = mongoose.model('Project');

    entries.forEach(function(e) {


     
       
        var project = new Project();
        project.name = e.name;
        project.address = '';
        project.narrative = '';
        project.category = e.category;
        project.lat = e.lat;
        project.lng = e.lng;

        var customFieldMap1 = {
            key: 'Year_Completed',
            value: e.year
        };

        project.customFields.push(customFieldMap1);

        var customFieldMap2 = {
            key: 'Sponsors',
            value: e.sponsors
        };

        project.customFields.push(customFieldMap2);


        project.save(function (err){
            console.log(project);
        });
   });

});


