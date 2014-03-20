var mongoose = require('mongoose');
var Project = require('../models/Project');
var Project = require('../models/Category');
var projectService = require('../routes/ProjectService');
var csvConvertor   = require('../custom_modules/record.js');
//var json2csv    = require('nice-json2csv');
var csv         = require('ya-csv');



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
    console.log(req.body);
	var Project = mongoose.model('Project');
   	var project = new Project();
    //console.log(project);
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
            console.log(custom_key);
            console.log(custom_value);
            var customFieldMap = { 
                key: custom_key,
                value: custom_value
            };
            project.customFields.push(customFieldMap);
        }
    }
    project.save(function(err) {
    	if (err) {
    		console.log("There was an error saving your project");
    		console.log(err);
    		return;
    	}
    	res.redirect('/admin');
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
    var reader = csv.createCsvFileReader("projects.csv", {columnsFromHeader:true, nestedQuotes:true});
    reader.addListener('data', function(data) {        
        projectService.findCategory(data, data.Category, function(categoryId) {
            var Project = mongoose.model('Project');
            var project = new Project();
            for(var index in data) {
                if(index == 'Name') {
                    project.name = data.Name;
                }else if(index == 'Narrative') {
                    project.narrative = data.Narrative;
                }else if(index == 'Address') {
                    project.address = data.Address;
                }else if(index == 'Lat') {
                    project.lat = data.Lat;
                }else if(index == 'Lng') {
                    project.lng = data.Lng;
                }else{
                    if(data[index]!='' && index!='Category') {
                        var customFieldMap = {
                            key: index.toString(),
                            value: data[index].toString()
                        }
                        project.customFields.push(customFieldMap);
                    }
                }
            }
            project.category = categoryId;
            project.save(function(err) {
                if(err) {
                    console.log("There was an error in saving your project");
                    console.log(err);
                    return;
                }
            });
        });
    });
    res.redirect('/admin');
}

exports.findCategory = function(projectData, projectCategory, callback) {
    var Category = mongoose.model('Category');
    Category.findOne({ name: projectCategory }, function(err, categoryReturned) {
        if (err) {
            console.log("Could not return a category");
            console.log(err);
            return;
        }
        if(categoryReturned == null) { //If category does not exist create a new category. 
            category = new Category({name : projectCategory});
            category.save(function(err, categoryCreated) {
                console.log('New Category Created');
                console.log(category);
                callback(categoryCreated._id);
            });
        }else {
            callback(categoryReturned._id);
        }
    });
}
