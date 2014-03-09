var mongoose = require( 'mongoose' ),
	 db = mongoose.createConnection('localhost', 'lacc');

var ProjectSchema = new mongoose.Schema({
	name: String,
	address: String,
	narrative: String,
	category: String,
	lat: Number,
	lng: Number
});

mongoose.model('Project', ProjectSchema );
mongoose.connect('mongodb://localhost:27017/lacc');