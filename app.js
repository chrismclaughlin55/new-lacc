var express = require('express'),
	http = require('http'),
	path = require('path');

var projectService = require('./routes/ProjectService');
var categoryService = require('./routes/CategoryService');
var mongoose    = require('mongoose');
var http = require('http');
var path = require('path');
var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server);

// all environments
app.configure(function() {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/public');
	app.engine('html', require('ejs').renderFile);
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.bodyParser());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Routes
app.get('/', categoryService.getCategoriesForIndex);
app.get('/index', categoryService.getCategoriesForIndex);

app.get('/admin', categoryService.getCategoriesForAdmin);
app.post('/admin/update-category', categoryService.updateCategory);
app.post('/admin/update-project', projectService.updateProject);
app.get('/admin/download', projectService.download);
app.get('/admin/upload', projectService.upload);

// Socket IO (Need to incorporate this into routes somehow)
io.sockets.on('connection', function(socket) {
    socket.on('projectsRequest', function() {
    	var Project = mongoose.model('Project');
    	Project.find(function(err, projects) {
	        if (err) {
	            console.log("Could not return projects");
	            console.log(err);
	            return;
	        }
        	socket.emit('projects', projects);
    	});
    });
    socket.on('categoriesRequest', function() {
    	var Category = mongoose.model('Category');
    	Category.find(function(err, categories) {
	        if (err) {
	            console.log("Could not return categoreis");
	            console.log(err);
	            return;
	        }
        	socket.emit('categories', categories);
    	});
    });
});

// http.createServer(app).listen(app.get('port'), function(){
//   console.log('Express server listening on port ' + app.get('port'));
// });
