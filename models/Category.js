var mongoose = require( 'mongoose' ),
	 db = mongoose.createConnection('localhost', 'lacc');

var CategorySchema = new mongoose.Schema({
	name: String
});

mongoose.model('Category', CategorySchema );
//mongoose.connect('mongodb://localhost:27017/lacc');
