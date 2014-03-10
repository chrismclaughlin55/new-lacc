var mapCenter = [34.0345474, -118.28396350000001];
var map;
var layers;
var cat_names;
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
                var point = L.marker([project.lat, project.lng]).addTo(map);
                // categoryList is a map from category_id to an array of points
                // project.category is an _id
                if (categoryMap[project.category]) {
                    categoryMap[project.category].push(point);    
                } else {
                    categoryMap[project.category] = [];
                    categoryMap[project.category].push(point);
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
