var mongoose        = require('mongoose');
var Project         = require('../models/Project');
var Category        = require('../models/Category');
var projectService  = require('../routes/ProjectService');
var categoryService = require('../routes/CategoryService');
var csvConvertor    = require('../custom_modules/CsvRecord.js');
var json2csv        = require('nice-json2csv');
var csv             = require('ya-csv');
var fs              = require('fs');

GridStore           = require('mongodb').GridStore,
Grid                = require('mongodb').Grid,
Code                = require('mongodb').Code,
BSON                = require('mongodb').pure().BSON,
assert              = require('assert');
ObjectId            = mongoose.Types.ObjectId;


exports.getProjects = function(projectFilter, callback) {
    var Project = mongoose.model('Project');
    var filter = {};
    if (projectFilter) {
        console.log(projectFilter);
        if (projectFilter.name) {
            filter.name = eval(projectFilter.name);
        }
        if (projectFilter.insideLA) {
            filter.insideLA = eval(projectFilter.insideLA);
        }
        if (projectFilter.categories && projectFilter.categories.length) {
            filter.$or = [];
            projectFilter.categories.forEach(function(cat) {
                filter.$or.push({category : ObjectId(cat)});
            });
        }
    }
    Project.find(filter, function(err, projects) {
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
    project.insideLA = req.body.location === 'true';
    if (req.body.custom_field_key) {
        if (req.body.custom_field_key instanceof Array) {
            for (var i = 0; i < req.body.custom_field_key.length; i++) {
                var custom_key = req.body.custom_field_key[i];
                var custom_value = req.body.custom_field_value[i];
                var customFieldMap = { 
                    key: custom_key,
                    value: custom_value
                };
                project.customFields.push(customFieldMap);
            }
        } else {
            var custom_key = req.body.custom_field_key;
            var custom_value = req.body.custom_field_value;
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
    } else {
        var temp = project.toObject();
        delete temp._id;
        projectService.storeImage(req, temp, function(){
            Project.update({"_id": mongoose.Types.ObjectId(req.body.p_id)}, temp, {upsert:true}, function (err, numberAffected, raw) {
                if (err){ 
                    console.log("error updating record "+ err); 
                    return;
                }
                // TODO: Do we need this?
                projectService.storeImage(req, project, function(){
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

exports.downloadByFilter = function(filter, callback) {
    var recordData = [];
    var filter;
    projectService.getProjects(filter, function(records) {
        records.forEach(function(r) {
            projectService.convertProjectToCsvRow(r, function(csvRecord) {
                recordData.push(csvRecord);
                if (recordData.length == records.length) {
                    var csvData = JSON.stringify(recordData);
                    callback(csvData);
                }
            });
        });
    });
}

exports.upload = function(req, callback) {
	categoryService.storeCategories(req, function(categoryHelper) {
        var projectReader = csv.createCsvFileReader(req.files.csvFile.path, {columnsFromHeader:true, nestedQuotes:true});
        projectReader.addListener('data', function(data) {
            data.name = data.name.replace(/"/g, "'"); //Converting double quotes to single quotes
            projectService.checkIfProjectExists(data.name, data.lat, data.lng, function(existingProject){
                if(existingProject!=null) {
                    existingProject.customFields = []; //empty customFields and overwrite data.
                    for(var index in data) {
                        if(index == 'narrative') {
                            existingProject.narrative = data.narrative;
                        }else if(index == 'address'){
                            existingProject.address = data.address;
                        }else {
                            if(data[index]!=null && data[index]!='' && index!='category' && index!= 'name' && index!='lat' && index!='lng') {
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
    callback();
}

/* Helper function to convert each project into a CSV row. */
exports.convertProjectToCsvRow = function(project, callback) {
    categoryService.getCategory(project.category, function(category) {
        csvConvertor(project, category.name, function(instance) {
            callback(instance.getInformation());
        });
    });
}

exports.checkIfProjectExists = function(projectName, projectLat, projectLng, callback) {
    var Project = mongoose.model('Project');
    Project.findOne({name: projectName.toString(), lat:projectLat, lng: projectLng}, function(err, projectReturned) {
        if(err){
            console.log("Error in removing project.");
        }
        if(projectReturned != null){
            callback(projectReturned);
        } else {
            callback(null);
        }      
    });
}
