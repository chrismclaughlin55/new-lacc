var mongoose        = require('mongoose');
var passport        = require('passport'),
    LocalStrategy   = require('passport-local').Strategy;
var bcrypt          = require('bcrypt-nodejs');
var User            = require('../models/User');
var categoryService = require('./CategoryService');

passport.use('local-signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback:true},
    function(req, username, password, done){
        var User = mongoose.model('User');
        var newUser = new User();
        newUser.type = "manager";
        newUser.local.username = username;
        newUser.local.password = newUser.generateHash(password);
        newUser.save(function(err){
            if(err)
                throw err;
            return done(null, newUser);
        });
    }
));

passport.use('local-login', new LocalStrategy(
    function(username, password, done){
        var User = mongoose.model('User');
        User.findOne({'local.username':username},function(err,user){
            if(err){return done(err);}
            if(!user){return done(null, false);}
            if(!user.validPassword(password)){return done(null, false);}
            return done(null, user);
        });
    }
));

passport.serializeUser(function(user,done){
    done(null, user.id);
});

passport.deserializeUser(function(id,done){
    var User = mongoose.model('User');
    User.findById(id,function(err,user){
        done(err, user); 
    });
});

exports.isLoggedIn = function(req,res, next){
    if(req.isAuthenticated())
        return next;
    res.redirect('/');
}

exports.hasLoggedIn = function(req, req, next){
    if(!req.isAuthenticated())
        return next;
    res.redirect('/admin');
}

exports.logout = function(req,res){
    req.logout();
    res.redirect('/login');
}

exports.login = function(req, res) {
	res.render('login.ejs');
}
