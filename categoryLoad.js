var mongodb = require('mongodb');
var mongoose = require('mongoose');
var Category = require('./models/Category');
var Project = require('./models/Project');


mongodb.MongoClient.connect("mongodb://localhost:27017/lacc", function(err,db) {
    var Project = mongoose.model('Project');
    var Category = mongoose.model('Category');
    for (var i = 1; i < 9; i++){
        (function(i){
            category = new Category({name : i.toString()});
            category.save(function(err){
                console.log("Category was saved.");
            });
        })(i);
    }   
    //Add custom categories here
});