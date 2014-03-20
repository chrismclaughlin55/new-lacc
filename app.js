var express = require('express'),
	http = require('http'),
	path = require('path');
var projectService = require('./routes/ProjectService');
var categoryService = require('./routes/CategoryService');
var userService = require('./routes/UserService');
var mongoose    = require('mongoose');
var http = require('http');
var path = require('path');
var json2csv = require('nice-json2csv');
var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server);

// all environments
app.configure(function() {
	app.use(json2csv.expressDecorator);
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
app.post('/admin/upload', projectService.upload);

app.get('/login', userService.login);

io.sockets.on('connection', function(socket) {
    socket.on('projectsRequest', function() {
    	projectService.getProjects(function(projects) {
    		socket.emit('projects', projects);
    	});
    });
    socket.on('categoriesRequest', function() {
    	categoryService.getCategories(function(categories) {
    		socket.emit('categories', categories);
    	});
    });
});
