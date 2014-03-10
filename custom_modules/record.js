var record = function () {
	this.data = {
		Name: '',
		Narrative: '',
		Address: '',
		Category: '',
		Lat: '',
		Lng: '',
		Year_Completed: '',
		Sponsors: ''
	};

	this.fill = function (info) {
		this.data.Name = info.name;
		this.data.Narrative = info.narrative;
		this.data.Address = info.address;
		if(info.category == null){
			this.data.Category = '';
		}else{
			this.data.Category = info.category;
		}
		this.data.Lat = info.lat;
		this.data.Lng = info.lng;
		for(var key in info.user_values){
			if(key =='Year Completed'){
				this.data.Year_Completed = info.user_values[key];
			}else if(key == 'Sponsors'){
				this.data.Sponsors = info.user_values[key];
			}else{
				this.data[key.toString()] = info.user_values[key];
			}
		}
	};

	this.getInformation = function () {
		return this.data;
	};
};

	module.exports = function (info) {
		var instance = new record();
		instance.fill(info);
		return instance;
	};