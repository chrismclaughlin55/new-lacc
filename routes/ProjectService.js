GridStore           = require('mongodb').GridStore,
Grid                = require('mongodb').Grid,
Code                = require('mongodb').Code,
BSON                = require('mongodb').pure().BSON,
assert              = require('assert');

var mongoose        = require('mongoose');
var Project         = require('../models/Project');
var Category = require('../models/Category');
var projectService  = require('../routes/ProjectService');
var csvConvertor    = require('../custom_modules/CsvRecord.js');
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
        projectService.storeImage(req,project,function(){
            project.save(function(err) {
                if (err) {
                    console.log("There was an error saving your project");
                    console.log(err);
                    return;
                }

                res.redirect('/admin');
            });
        });
    }else {
        var temp = project.toObject();
        delete temp._id;
        projectService.storeImage(req,temp,function(){
            Project.update({"_id": mongoose.Types.ObjectId(req.body.p_id)}, temp, {upsert:true}, 
                function (err, numberAffected, raw) {
                    if (err){ 
                        console.log("error updating record "+ err); 
                        return;
                    }
                    projectService.storeImage(req,project,function(){
                        console.log("project "+project.name+" has had an image added");
                    });
                    console.log('The number of updated documents was %d', numberAffected);
                    res.redirect('/admin');
                });
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
    var recordData = [];
    projectService.getProjects(function(records) {
        records.forEach(function(r) {
            projectService.convertProjectToCsvRow(r, function(csvRecord) {
                recordData.push(csvRecord);
                if(recordData.length == records.length) {
                    var csvData = JSON.stringify(recordData);
                    res.csv(JSON.parse(csvData), "projects.csv");
                }
            });
        });
    });
}

exports.storeCategories = function(req, callback) {
    var callbackCounter = 0;
    var categoryHelper = {}; //key: {categoryName} value: {_id of categoryName}
    var categoryReader = csv.createCsvFileReader(req.files.csvFile.path, {columnsFromHeader:true, nestedQuotes:true});
    categoryReader.addListener('data', function(data) { 
        if(data.category!='')
            categoryHelper[data.category] = '';
    });  
    categoryReader.addListener('end', function() {
        for(var key in categoryHelper) {
            (function(key) {
                projectService.getCategoryIdByName(key, function(categoryId) {
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


    projectService.storeCategories(req, function(categoryHelper) {
        var projectReader = csv.createCsvFileReader(req.files.csvFile.path, {columnsFromHeader:true, nestedQuotes:true});
        projectReader.addListener('data', function(data) {
            data.name = data.name.replace(/"/g, "'"); //Converting double quotes to single quotes
            projectService.checkIfProjectExists(data.name, data.lat, data.lng, function(existingProject){
                if(existingProject!=null) {
                    existingProject.customFields.length = 0; //empty customFields and overwrite data.
                    for(var index in data) {
                        if(index == 'narrative') {
                            existingProject.narrative = data.narrative;
                        }else if(index == 'address'){
                            existingProject.address = data.address;
                        }else {
                            if(data[index]!=null && data[index]!='' && index!='category') {
                                var customFieldMap = {
                                    key: index.toString(),
                                    value: data[index].toString()
                                }
                                existingProject.customFields.push(customFieldMap);
                            }
                        }
                    }
                    existingProject.save(function(err){
                        console.log("Project was updated.")
                    });
                }else {
                    var Project = mongoose.model('Project');
                    var project = new Project();
                    for(var index in data) {
                        if(index == 'name') {
                            project.name = data.name;
                        }else if(index == 'narrative') {
                            project.narrative = data.narrative;
                        }else if(index == 'address') {
                            project.address = data.address;
                        }else if(index == 'lat') {
                            project.lat = data.lat;
                        }else if(index == 'lng') {
                            project.lng = data.lng;
                        }else {
                            if(data[index]!=null && data[index]!='' && index!='category') {
                                var customFieldMap = {
                                    key: index.toString(),
                                    value: data[index].toString()
                                }
                                project.customFields.push(customFieldMap);
                            }
                        }
                    }
                    project.category = categoryHelper[data.category];
                    project.save(function(err) {
                        if(err) {
                            console.log("There was an error in saving your project");
                            console.log(err);
                            return;
                        }
                    });
                }
            });
});
});
res.redirect('/admin');
}

/* Helper function to convert each project into a CSV row. */
exports.convertProjectToCsvRow = function(project, callback) {
    projectService.getCategoryNameById(project.category, function(categoryName) {
        csvConvertor(project, categoryName, function(instance) {
            callback(instance.getInformation());
        });
    });
}

/* Input: CategoryId, Output: CategoryName */
exports.getCategoryNameById = function(categoryId, callback) {
    var Category = mongoose.model('Category');
    Category.findById(categoryId, function(err, categoryReturned) {
        if(categoryReturned!=null) {
            callback(categoryReturned.name);
        }else {
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

    exports.checkIfProjectExists = function(projectName, projectLat, projectLng, callback) {
        var Project = mongoose.model('Project');
        Project.findOne({name: projectName.toString(), lat:projectLat, lng: projectLng}, function(err, projectReturned){
            if(err){
                console.log("Error in removing project.");
            }
            if(projectReturned!=null){
             callback(projectReturned);
         }else {
            callback(null);
        }
        
    });
    }




