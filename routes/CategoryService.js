var mongoose = require('mongoose');
var Category = require('../models/Category');

var getCategories = function(callback) {
	var Category = mongoose.model('Category');
	Category.find(function (err, categories) {
		if (err) {
			console.log("Error finding categories");
			return;
		}
		callback(categories);
	});
}

exports.getCategoriesForAdmin = function(req, res) {
	getCategories(function(data) {
		res.render('admin.ejs', {
			categories: data
		});
	});
}

exports.getCategoriesForIndex = function(req, res) {
	getCategories(function(data) {
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