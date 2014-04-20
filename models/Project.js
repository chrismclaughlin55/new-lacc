var mongoose = require( 'mongoose' ),
db 			 = mongoose.createConnection('localhost', 'lacc');

var ProjectSchema = new mongoose.Schema({
		name: String,
		address: String,
		narrative: String,
		category: {type : mongoose.Schema.Types.ObjectId, ref: 'Category'},
		lat: Number,
		lng: Number,
		insideLA: Boolean,
		customFields: 
		[
			{
				key: String,
				value: String,
				_id: false 
			}
		],
		images:
		[
			Buffer
		]
});

mongoose.model('Project', ProjectSchema );
mongoose.connect('mongodb://localhost:27017/lacc');


