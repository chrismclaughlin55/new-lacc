var mongoose = require('mongoose');
var Category = require('../models/Category');
var categoryService = require('../routes/CategoryService');
var fs              = require('fs');

GridStore           = require('mongodb').GridStore,
Grid                = require('mongodb').Grid,
Code                = require('mongodb').Code,
BSON                = require('mongodb').pure().BSON,
assert              = require('assert');

exports.getCategories = function(callback) {
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
	categoryService.getCategories(function(data) {
		res.render('admin.ejs', {
			categories: data
		});
	});
}

exports.getCategoriesForIndex = function(req, res) {
	categoryService.getCategories(function(data) {
		res.render('index.ejs', {
			categories: data
		});
	});
}

exports.updateCategory = function(req, res) {
	var Category = mongoose.model('Category');
	var category = new Category();
	category.name = req.body['new_category'];
	categoryService.storeImage(req, category, function() {
		category.save(function(err) {
			if (err) {
				console.log("There was an error updating your category");
				console.log(err);
				return;
			}
			res.redirect('/admin');
		});
	});
}

exports.storeImage = function(req, category, callback) {
    if (req.files['category_image']) {
        var image = req.files['category_image'];
        category.image = fs.readFileSync(image.path);
    }
    callback();
}

exports.readImage = function(req, res) {
    var Category = mongoose.model('Category');
    var category_id = req.params.category;
    Category.findById(req.params.category, function(err, category) {
    	res.contentType('image/png');
        if (err || !category) {
            console.log("There was an error finding image for project: " + category_id);
            var img = fs.readFileSync('./public/pin.png');
        	res.send(img);
        } else {
        	if (category.image && category.image.length) {
        		res.send(category.image);
        	} else {
        		var img = fs.readFileSync('./public/pin.png');
        		res.send(img);
        	}
        }
    });
}
