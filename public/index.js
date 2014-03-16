var mapCenter = [34.0345474, -118.28396350000001];
var map;
var tile = 'http://{s}.tile.cloudmade.com/bcaf462f30bd4c02a7378b1bc17dd6b6/997/256/{z}/{x}/{y}.png'
var Esri_WorldTopoMap = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';  

document.addEventListener('DOMContentLoaded', function() {
    map = L.map('map', {
        center: mapCenter,
        zoom: 13,
        maxZoom: 15,
        minZoom: 0
    });

    L.tileLayer( Esri_WorldTopoMap, {
    }).addTo(map);

    var categoryMap = {};
    var socket = io.connect('http://localhost:3000');
    socket.on('projects', function(projects) {
        socket.on('categories', function(categories) {
            projects.forEach(function(project) {
                var marker = L.marker([project.lat, project.lng]).addTo(map);
                marker.project = project;
                // TODO: @Roy, not sure how to use jquery with this so I just did it in this messy way
                // We should clean this up when we get a chance.
                marker.on('click', function() {
                    var imageTag = "";
                    for (var i = 0; i < marker.project.images.length; i++) {
                        var url = '/project/' + marker.project._id + '/image/' + i;
                        imageTag += '<img src="' + url + '" width="100" height="100">';
                    }
                    document.getElementById('photos').innerHTML = imageTag;
                });
                // categoryList is a map from category_id to an array of points
                // project.category is an _id
                if (categoryMap[project.category]) {
                    categoryMap[project.category].push(marker);    
                } else {
                    categoryMap[project.category] = [marker];
                }
            });
            var overLayMap = {};
            categories.forEach(function(category) {
                overLayMap[category.name] = L.layerGroup(categoryMap[category._id]);
            });
            L.control.layers(null, overLayMap).addTo(map);
        });
    });
    socket.emit('projectsRequest');
    socket.emit('categoriesRequest');
}, false);
