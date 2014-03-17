var mongoose = require('mongoose');
var Project = require('../models/Project');
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
	var reader = csv.createCsvFileReader(req.files.csvFile.path, {columnsFromHeader:true, nestedQuotes:true});
    reader.addListener('data', function(data) {
    	var Project = mongoose.model('Project');
   		var project = new Project();
	    project.name = data.Name;
	    project.narrative = data.Narrative;
	    project.address = data.Address;
	    project.category = data.Category;
	    project.lat = data.Lat;
   		project.lng = data.Lng;
        for (var index in data){ //Checking for custom fields. 
            if(!(index=='Name' || index=='Narrative' || index == 'Address' || index == 'Category' || index == 'Lat' || index == 'Lng')){
                if(data[index]!=''){
                    var customField = {
                        key: index.toString(),
                        value: data[index].toString()
                    }
                    project.customFields.push(customField);
                }
            }
        }
        project.save(function(err) {
	    	if (err) {
	    		console.log("There was an error saving your project");
	    		console.log(err);
	    		return;
	    	}
    	});
	});
    res.redirect('/admin');
}