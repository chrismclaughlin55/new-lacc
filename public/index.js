var mapCenter = [34.0345474, -118.28396350000001];
var map;
var countyMap = {};
var polygonMap = {};
var tile = 'http://{s}.tile.cloudmade.com/bcaf462f30bd4c02a7378b1bc17dd6b6/997/256/{z}/{x}/{y}.png'
var Esri_WorldTopoMap = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';  

document.addEventListener('DOMContentLoaded', function() {
    map = L.map('map', {
        center: mapCenter,
        zoom: 13,
        maxZoom: 15,
        minZoom: 9
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
                marker.on('click', function() { //This requires the user to double click a point right now... maybe it should happen regardless of load?
                    // var imageTag = '<a rel="group" href="dummy1.jpg"><img src="dummy1.jpg" alt="" width="80" height="80"></a><img src="dummy2.jpeg" width="80" height="80">'
                    //Roy: dummy image code:
                    var imageTag = "";
                    for (var i = 0; i < marker.project.images.length; i++) {
                        var url = '/project/' + marker.project._id + '/image/' + i;
                        imageTag += '<img src="' + url + '" width="100" height="100">';
                    } 
                    // TODO: We should put narrative / description in here.
                    var narrativeTag = "<div>Give me example text and il format it correctly, then we'll put the right collection call here.</div>";
                    marker.bindPopup(imageTag + narrativeTag);
                });
                // categoryList is a map from category_id to an array of points
                // project.category is an _id
                if (categoryMap[project.category]) {
                    categoryMap[project.category].push(marker);    
                } else {
                    categoryMap[project.category] = [marker];
                }
                if (countyMap[project.county]) {
                    countyMap[project.county].push(marker);
                } else {
                    countyMap[project.county] = [marker];
                }
            });
            var overLayMap = {};
            categories.forEach(function(category) {
                overLayMap[category.name] = L.layerGroup(categoryMap[category._id]);
            });
            L.control.layers(null, overLayMap).addTo(map);
            for (var entry in countyMap) {
                var polygonCoordinates = [];
                var highLat, highLng, lowLat, lowLng;
                highLat = lowLat = countyMap[entry][0].project.lat;
                highLng = lowLng = countyMap[entry][0].project.lng;
                countyMap[entry].forEach(function(marker) {
                    var coordinates = [marker.project.lat, marker.project.lng];
                    if (marker.project.lat > highLat) {
                        highLat = marker.project.lat;
                    }
                    if (marker.project.lat < lowLat) {
                        lowLat = marker.project.lat;
                    }
                    if (marker.project.lng > highLng) {
                        highLng = marker.project.lng;
                    }
                    if (marker.project.lng < lowLng) {
                        lowLng = marker.project.lng;
                    }
                });
                // var polygon = L.polygon([[highLat, highLng], [highLat, lowLng], [lowLat, lowLng], [lowLat, highLng]]);
                var polygon = L.polygon([[highLat, highLng], [highLat, lowLng], [lowLat, lowLng], [lowLat, highLng]]);
                polygonMap[entry] = polygon;
            }
        });
    });
    socket.emit('projectsRequest');
    socket.emit('categoriesRequest');
}, false);

// County Districts are hard coded
$(function(){
    $('#county-2').click(function () {
        if ($('#county-2').is(':checked')) {
            polygonMap[2].addTo(map);
        } else {
            map.removeLayer(polygonMap[2]);
        }
    });
});
$(function(){
    $('#county-3').click(function () {
        polygonMap[3].addTo(map);
    });
});
