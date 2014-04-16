var mapCenter = [34.0345474, -118.28396350000001];
var map;
var tile = 'http://{s}.tile.cloudmade.com/bcaf462f30bd4c02a7378b1bc17dd6b6/997/256/{z}/{x}/{y}.png'
var Esri_WorldTopoMap = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';  
var markers = new L.layerGroup();
var markerArray = new Array();




document.addEventListener('DOMContentLoaded', function() {
    map = L.map('map', {
        center: mapCenter,
        zoom: 14,
        //maxZoom: 15,
        //minZoom: 9
    });
 

 document.getElementById('filter').onclick = function (){
    console.log("filtered called arr size: "+markerArray.length);
    var string = document.getElementById('filtered_string').value;
    var regex = new RegExp(string, 'i');
    // map.
    console.log(string);
map.removeLayer(markers);

markers = new L.layerGroup();
    markerArray.forEach(function(project){
        if(regex.test(project.name)){
            console.log(project.name);
        marker =  L.marker([project.lat, project.lng]);
        marker.project = project;
        marker.addTo(markers);
    }
    markers.addTo(map);
    });
}


    markers.addTo(map);
    L.tileLayer( Esri_WorldTopoMap, {}).addTo(map);

    var categoryMap = {};
    var socket = io.connect('http://localhost:3000');

    socket.on('projects', function(projects) {
        socket.on('categories', function(categories) {
            projects.forEach(function(project) {
                var marker = L.marker([project.lat, project.lng]).addTo(markers);
                markerArray.push(project);

                console.log(markerArray.length);

                marker.project = project;
                var narrativeTag = "<div><div><strong>" + project.name + ": </strong>" + project.narrative + "</div>";
                for (var i = 0; i < marker.project.customFields.length; i++)
                    narrativeTag += "<div>" + marker.project.customFields[i].key + ": " + marker.project.customFields[i].value + "</div>";  
                narrativeTag += "<div>" + marker.project.address + "</div></div>";
                var imageTag = "";
                
                for (var i = 0; i < marker.project.images.length; i++) {
                    var url = '/project/' + marker.project._id + '/image/' + i;
                    imageTag += '<div><img src="' + url + '" width="100" height="100"></div>';
                } 

                marker.bindPopup(narrativeTag + imageTag);
                // categoryList is a map from category_id to an array of points
                // project.category is an _id
                if (categoryMap[project.category]) {
                    categoryMap[project.category].push(marker);    
                } else {
                    categoryMap[project.category] = [marker];
                }
            });
var overLayMap = {};
for (var i = 0; i < categories.length; i++) 
    overLayMap[categories[i].name] = L.layerGroup(categoryMap[categories[i]._id]);
L.control.layers(null, overLayMap).addTo(map);
});
});
socket.emit('projectsRequest');
socket.emit('categoriesRequest');

L.Util.requestAnimFrame(map.invalidateSize,map,!1,map._container);
map.removeLayer(markers);

console.log(markerArray.length+" made it here");


}, false);


