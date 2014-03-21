/*
	Template to convert from Project Document to a CSV Row.
*/

var CsvRecord = function () {
	
	this.data = {
		name: '',
		narrative: '',
		address: '',
		category: '',
		lat: '',
		lng: '',
	};

	this.fill = function (projectDocument, category) {
		this.data.name = projectDocument.name;
		this.data.narrative = projectDocument.narrative;
		this.data.address = projectDocument.address;
		this.data.category = category;
		if(projectDocument.lat == null) {
			this.data.lat = 0
		}else {
			this.data.lat = projectDocument.lat;
		}
		if(projectDocument.lng == null) {
			this.data.lng = 0
		}else {
			this.data.lng = projectDocument.lng;
		}
		//Creating keys for customFields
		for(var i = 0; i < projectDocument.customFields.length; i++) {
			if(projectDocument.customFields[i].value != '')
				this.data[projectDocument.customFields[i].key] = projectDocument.customFields[i].value;
		}
	};

	this.getInformation = function () {
		return this.data;
	};
};

module.exports = function (projectDocument, category, callback) {
		var instance = new CsvRecord();
		instance.fill(projectDocument, category);
		callback(instance);
};

