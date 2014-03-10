var mongoose    = require('mongoose'),
    db = mongoose.createConnection('localhost', 'lacc');
var bcrypt      = require('bcrypt-nodejs');

var UserSchema  = new mongoose.Schema({
    type        :String,
    local       :{
          username:String,
          password:String
    }
});

UserSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

UserSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.local.password);
};

mongoose.model('User', UserSchema);
