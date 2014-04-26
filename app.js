var express = require('express'),
	http = require('http'),
	path = require('path');
var projectService = require('./routes/ProjectService');
var categoryService = require('./routes/CategoryService');
var userService = require('./routes/UserService');
var mongoose    = require('mongoose');
var passport    = require('passport'), LocalStrategy = require('passport-local').Strategy;
var bcrypt        = require('bcrypt-nodejs');
var http = require('http');
var path = require('path');
var async = require('async');
var json2csv = require('nice-json2csv');
var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server, {log:false});
var flash = require('connect-flash');

// all environments
app.configure(function() {
	app.use(json2csv.expressDecorator);
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/public');
	app.engine('html', require('ejs').renderFile);
	app.use(express.bodyParser({uploadDir: __dirname + '/public/uploads'}));
	app.use(express.favicon());
	app.use(express.json());
	app.use(express.bodyParser());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.session({secret:'chacharealsmooth'}));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Index
app.get('/', function(req, res) {
    categoryService.getCategories(function(data) {
        res.render('index.ejs', {
            categories: data
        });
    });
});

app.get('/index', function(req, res) {
    categoryService.getCategories(function(data) {
        res.render('index.ejs', {
            categories: data
        });
    });
});

app.get('/download', function(req, res) {
    projectService.downloadByFilter(req.query, function(csvData) {
        res.csv(JSON.parse(csvData), "projects.csv");
    });
});

// Admin
app.get('/admin', userService.isLoggedIn, function(req, res) {
    categoryService.getCategories(function(data) {
        res.render('admin.ejs', {
            categories: data
        });
    });
});

app.post('/admin/create-category', function(req, res) {
    categoryService.createCategory(req, function() {
        res.redirect('/admin');
    });
});

app.post('/admin/update-categories', function(req, res) {
    var categoryIds = Object.keys(req.body);
    async.forEach(categoryIds, function(categoryId, callback) {
        categoryService.updateCategory(categoryId, req.body[categoryId], req.files[categoryId], callback);
    }, function(err) {
        res.redirect('/admin');
    });
});

app.post('/admin/update-project', projectService.updateProject);

app.post('/admin/upload', function(req, res) {
    projectService.upload(req, function() {
        res.redirect('/admin');
    });
});

// User Authentication
app.get('/login',userService.login);
app.get('/logout', userService.logout);
app.post('/login-user',
    passport.authenticate('local-login', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })
);
app.post('/signup-user',
    passport.authenticate('local-signup', {
        successRedirect:'/login',
        failureRedirect:'/',
        failureFlash: true
    })
);

app.get('/project/:project/image/:image', projectService.readImage);
app.get('/category/:category/image', categoryService.readImage);

io.sockets.on('connection', function(socket) {
    socket.on('projectsRequest', function(projectFilter) {
    	projectService.getProjects(projectFilter, function(projects) {
    		socket.emit('projects', projects);
    	});
    });
    socket.on('categoriesRequest', function() {
    	categoryService.getCategories(function(categories) {
    		socket.emit('categories', categories);
    	});

    });
});
