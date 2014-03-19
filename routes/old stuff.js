var mongodb = require('mongodb');
var mongoose = require('mongoose');
var Project = require('./models/Project');
var Category = require('./models/Category');


mongodb.MongoClient.connect("mongodb://localhost:27017/lacc", function(err,db) {
    var entries = require('./load.json');
            var Project = mongoose.model('Project');

    entries.forEach(function(e) {

        load.findCategory(e, function(id){
            var project = new Project();
            project.name = e.name;
            project.address = '';
            project.narrative = '';
            project.category = id;
            project.lat = e.lat;
            project.lng = e.lng;

        });
       
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
            console.log("record added");
        });
   });

});

exports.findCategory = function(projectData, callback) {
    var Category = mongoose.model('Category');
    Category.findOne({ name: projectData.category }, function(err, category){
        if (err) {
            console.log("Could not return a category");
            console.log(err);
            return;
        }
        if(category == null){ //If category does not exist create a new category. 
            category = new Category({name : projectData.category});
            category.save(function(err){
                console.log('New Category Created');
                callback(category._id);
            });
        }else{
            callback(category._id);
        }
    });
}
