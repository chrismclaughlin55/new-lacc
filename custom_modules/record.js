// Provides a template for the csv file to follow.

var record = function () {
	this.data = {
		Name: '',
		Narrative: '',
		Address: '',
		Category: '',
		Lat: '',
		Lng: '',
	};

	this.fill = function (info) {
		this.data.Name = info.name;
		this.data.Narrative = info.narrative;
		this.data.Address = info.address;
		this.data.Category = info.category;
		this.data.Lat = info.lat;
		this.data.Lng = info.lng;
		for(var i = 0; i < info.customFields.length; i++){
			if(info.customFields[i].value != '')
				this.data[info.customFields[i].key] = info.customFields[i].value;
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