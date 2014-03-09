var mongoose = require('mongoose');
var Category = require('../models/Category');

exports.getCategories = function(callback) {
	var Category = mongoose.model('Category');
	Category.find(function (err, categories) {
		if (err) {
			console.log("Error finding categories");
			return;
		}
		return categories;
	});
}

exports.getCategoriesForAdmin = function(req, res) {
	var Category = mongoose.model('Category');
	Category.find(function (err, data) {
		if (err) {
			console.log("Error finding projects");
			return;
		}
		res.render('admin.ejs', {
        	categories: data
        }); 
	});
}

exports.getCategoriesForIndex = function(req, res) {
	var Category = mongoose.model('Category');
	Category.find(function (err, data) {
		if (err) {
			console.log("Error finding projects");
			return;
		}
		res.render('index.ejs', {
        	categories: data
        }); 
	});
}

exports.updateCategory = function(req, res) {
	var Category = mongoose.model('Category');
	var category = new Category();
	category.name = req.body['new_category'];
	category.save(function(err) {
		if (err) {
			console.log("There was an error updating your category");
			console.log(err);
			return;
		}
		res.redirect('/admin');
	});
}