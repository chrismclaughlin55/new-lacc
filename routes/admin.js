var mongoose = require('mongoose');
var Project = require('../models/Project');
var Category = require('../models/Category');

exports.admin = function(req, res) {
	var Category = mongoose.model('Category');
	Category.find(function (err, data) {
		if (err) {
			console.log("Error finding projects");
			return;
		}
		console.log(data);
		res.render('admin.ejs', {
        	categories: data
        }); 
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
    project.lat = parseFloat(req.body.project_lat),
    project.lng = parseFloat(req.body.project_lng)
    project.save(function(err) {
    	if (err) {
    		console.log("There was an error saving your project");
    	}
    	res.redirect('/admin');
    });
}