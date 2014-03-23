GridStore           = require('mongodb').GridStore,
Grid                = require('mongodb').Grid,
Code                = require('mongodb').Code,
BSON                = require('mongodb').pure().BSON,
assert              = require('assert');

var mongoose        = require('mongoose');
var Project         = require('../models/Project');
var projectService  = require('../routes/ProjectService');
var csvConvertor    = require('../custom_modules/record.js');
var json2csv        = require('nice-json2csv');
var csv             = require('ya-csv');
var fs              = require('fs');

exports.getProjects = function(callback) {
    var Project = mongoose.model('Project');
    Project.find(function(err, projects) {
        if (err) {
            console.log("Could not return projects");
            console.log(err);
            return;
        }
        callback(projects);
    });
}

exports.updateProject = function(req, res) {
	var Project = mongoose.model('Project');
    var project = new Project();

    project.name = req.body.project_name;
    project.address = req.body.project_address;
    project.narrative = req.body.project_narratives;
    // Stores the id of the category.
    project.category = req.body.project_category;
    project.lat = parseFloat(req.body.project_lat);
    project.lng = parseFloat(req.body.project_lng);
    if (req.body.custom_field_key) {
        for (var i = 0; i < req.body.custom_field_key.length; i++) {
            var custom_key = req.body.custom_field_key[i];
            var custom_value = req.body.custom_field_value[i];
            var customFieldMap = { 
                key: custom_key,
                value: custom_value
            };
            project.customFields.push(customFieldMap);
        }
    }

    if(req.body.p_id == ''){
     project.save(function(err) {
        if (err) {
            console.log("There was an error saving your project");
            console.log(err);
            return;
        }
        res.redirect('/admin');
    });
 }else {
    var temp = project.toObject();
    delete temp._id;
    Project.update({"_id": mongoose.Types.ObjectId(req.body.p_id)}, temp, {upsert:true}, 
        function (err, numberAffected, raw) {
            if (err){ 
                console.log("error updating record "+ err); 
                return;
            }
            console.log('The number of updated documents was %d', numberAffected);
            res.redirect('/admin');
        });
    }

}


exports.storeImage = function(req, project, callback) {
    if (req.files['imgFile']) {
        if (req.files['imgFile'].length) {
            req.files['imgFile'].forEach(function(image) {
                project.images.push(fs.readFileSync(image.path));
            });
        } else {
            var image = req.files['imgFile'];
            project.images.push(fs.readFileSync(image.path));
        }
    }
    callback();
}

exports.readImage = function(req, res) {
    var Project = mongoose.model('Project');
    var project_id = req.params.project;
    var image_id = req.params.image;
    Project.findById(project_id, function(err, project) {
        if (err) {
            console.log("There was an error finding image for project: " + project_id + " and id: " + image_id);
            res.send();
        }
        res.contentType('image/png');
        res.send(project.images[image_id]);
    });
   
}

exports.download = function(req, res) {
	projectService.getProjects(function(records) {
		var recordData = [];
        records.forEach(function(r){
            var tempRecord = csvConvertor(r);
            recordData.push(tempRecord.getInformation());
        });
        var csvData = JSON.stringify(recordData);
        res.csv(JSON.parse(csvData), "projects.csv");
    });
}

exports.upload = function(req, res) {
	var reader = csv.createCsvFileReader(req.files.csvFile.path, {columnsFromHeader:true, nestedQuotes:true});
    var writer = new csv.CsvWriter(process.stdout);
    reader.addListener('data', function(data) {
        var Project = mongoose.model('Project');
        var project = new Project();
        project.name = data.Name;
        project.narrative = data.Narrative;
        project.address = data.Address;
        project.category = data.Category;
        project.lat = data.Lat;
        project.lng = data.Lng;
        project.save(function(err) {
            if (err) {
                console.log("There was an error saving your project");
                console.log(err);
                return;
            }
        });
    });
}