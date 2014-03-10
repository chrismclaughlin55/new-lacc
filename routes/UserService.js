var mongoose = require('mongoose');

exports.login = function(req, res) {
	res.render('login.ejs');
}