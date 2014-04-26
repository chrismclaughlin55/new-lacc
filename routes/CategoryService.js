var mongoose = require('mongoose');
var Category = require('../models/Category');
var categoryService = require('../routes/CategoryService');
var fs              = require('fs');
var csvConvertor    = require('../custom_modules/CsvRecord.js');
var json2csv        = require('nice-json2csv');
var csv             = require('ya-csv');

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

/* Input: CategoryId, Output: Category */
exports.getCategory = function(categoryId, callback) {
    var Category = mongoose.model('Category');
    Category.findById(categoryId, function(err, category) {
        if (category != null) {
            callback(category);
        } else {
            callback('');
        }
    });
}

/*
Input: A CSV Row. Check to see if category exists for the project. 
If category exits return category id. Else create a new category and return the category id. 
*/
exports.getCategoryIdByName = function(projectCategory, callback) {
    var Category = mongoose.model('Category');
    Category.findOne({ name: projectCategory }, function(err, categoryReturned) {
        if (err) {
            console.log("Could not return a category");
            console.log(err);
            return;
        }
        if (categoryReturned == null) { //If category does not exist create a new category. 
            category = new Category({name : projectCategory});
            category.save(function(err, categoryCreated) {
                console.log('New Category Created');
                console.log(category);
                callback(categoryCreated._id);
            });
        } else {
            callback(categoryReturned._id);
        }
    });
}

exports.createCategory = function(req, callback) {
	var Category = mongoose.model('Category');
	var category = new Category();
	category.name = req.body['new_category'];
	categoryService.storeImage(req.files['category_image'], category, function() {
		category.save(function(err) {
			if (err) {
				console.log("There was an error updating your category");
				console.log(err);
				return;
			}
			callback();
		});
	});
}

/* Callback wil return true if error */
exports.updateCategory = function(categoryId, newName, newImage, callback) {
	var Category = mongoose.model('Category');
	categoryService.getCategory(categoryId, function(category) {
		if (newName) {
			category.name = newName;
		}
		categoryService.storeImage(newImage, category, function() {
			var jsonCat = category.toObject();
        	delete jsonCat._id;
			Category.update({"_id": mongoose.Types.ObjectId(categoryId)}, jsonCat, {upsert:true}, function (err) {
                if (err){ 
                    console.log("error updating record "+ err);
                    callback(true); 
                    return;
                }
                callback(false);
            });
		});
	});
}

exports.storeImage = function(image, category, callback) {
    if (image && image.path && image.originalFilename) {
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

exports.storeCategories = function(req, callback) {
    var callbackCounter = 0;
    var categoryHelper = {}; //key: {categoryName} value: {_id of categoryName}
    var categoryReader = csv.createCsvFileReader(req.files.csvFile.path, {columnsFromHeader:true, nestedQuotes:true});
    categoryReader.addListener('data', function(data) { 
        if (data.category!='') {
            categoryHelper[data.category] = '';
        }
    });  
    categoryReader.addListener('end', function() {
        for(var key in categoryHelper) {
            (function(key) {
                categoryService.getCategoryIdByName(key, function(categoryId) {
                    categoryHelper[key] = categoryId;
                    callbackCounter++;
                    if(callbackCounter == (Object.keys(categoryHelper).length)) {
                        callback(categoryHelper);
                    }
                })
            })(key);
        }
    });     
}