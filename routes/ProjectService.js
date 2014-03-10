var mongoose = require('mongoose');
var Project = require('../models/Project');

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
	getProjects(function(results) {
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