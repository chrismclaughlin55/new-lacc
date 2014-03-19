var mapCenter = [34.0345474, -118.28396350000001];
var map;
var cloudmade = 'http://{s}.tile.cloudmade.com/bcaf462f30bd4c02a7378b1bc17dd6b6/997/256/{z}/{x}/{y}.png';
var Esri_WorldStreetMap = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
var Esri_WorldTopoMap = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
/*

*/        
// Need to refactor this code to make more elegant. This looks like garbage.              
var updateData = function (m) {
    for(i in m.data.customFields){
        console.log(i);
    }
    document.getElementById('p_id').value = m.data._id;
    document.getElementById('project_name').value = m.data.name;
    document.getElementById('project_category').value = m.data.category;
    document.getElementById('project_narrative').value = m.data.narrative;
    document.getElementById('project_address').value = m.data.address;
    document.getElementById('project_lat').value = m.getLatLng().lat;
    document.getElementById('project_lng').value = m.getLatLng().lng;
    var matches = document.querySelectorAll('#entry_list .user_label');


    for (var i = 0; i < matches.length; ++i) {
        matches.item(i).parentNode.parentNode.removeChild(matches.item(i).parentNode);
    }
    document.getElementById("custom_field_injection_div").innerHTML = '';
    for(i in m.data.customFields){
        document.getElementById("custom_field_injection_div").innerHTML +='<input name="custom_field_key" type="text" value="'+m.data.customFields[i]['key'] + '"class="field_key"><input name="custom_field_value" class="field_value" type="text" value="' + m.data.customFields[i]['value'] + '"></input>';
        


    }
    // for (var key in m.data.user_values) {
    //     if (m.data.user_values.hasOwnProperty(key)) {
    //         var entry = document.createElement('li');
    //         var label = document.createElement('input');
    //         label.setAttribute('type', 'text');
    //         label.setAttribute('placeholder', 'Label');
    //         label.setAttribute('class', 'user_label');
    //         label.setAttribute('name', 'user_label'+len);
    //         label.value = key;
    //         var input = document.createElement('input');
    //         input.setAttribute('type', 'text');
    //         input.setAttribute('placeholder', 'Value');
    //         input.setAttribute('class', 'user_value');
    //         input.setAttribute('name', 'user_value'+len);
    //         input.value = m.data.user_values[key];
    //         entry.appendChild(label);
    //         entry.appendChild(input);
    //         document.getElementById('entry_list').appendChild(entry);
    //     }
    // }
}

document.addEventListener('DOMContentLoaded', function() {
    var socket = io.connect('http://localhost');
    map = L.map('map').setView(mapCenter, 13);

    L.tileLayer(Esri_WorldTopoMap, {
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    document.getElementById("add_point").onclick = points;
    function points() {
        var pinIcon = L.icon(
        {   
            iconUrl: '/pin.png',
            iconSize:     [38, 95], // size of the icon
            shadowSize:   [50, 64], // size of the shadow
            iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
            shadowAnchor: [4, 62],  // the same for the shadow
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        });
        var ic = pinIcon;

        var newMarker =
        L.marker(map.getCenter(), {icon: ic, draggable:'true', clickable:'true'});

        newMarker.data = {
            _id: '',
            name: '',
            category: '',
            narrative: '',
            address: '',

            coords: {
                point: {
                    lat: newMarker.getLatLng().lat,
                    lng: newMarker.getLatLng().lng
                }
            }
        };

        updateData(newMarker);

        newMarker.on('dragend', function(e) {
            updateData(newMarker);
        });

        if(document.getElementById("add_point").value == "add_point")
            console.log("add point value = add_point")
        if(document.getElementById("add_point").value == "edit_point")
            console.log("add point value = edit_point")
        newMarker.addTo(map);
    };

    document.getElementById("add_entry").onclick = function() {
        var len = document.querySelectorAll('#entry_list .user_label').length;
        var entry = document.createElement('li');
        var label = document.createElement('input');
        label.setAttribute('type', 'text');
        label.setAttribute('placeholder', 'Label');
        label.setAttribute('class', 'user_label');
        label.setAttribute('name', 'user_label'+len);
        var input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', 'Value');
        input.setAttribute('class', 'user_value');
        input.setAttribute('name', 'user_value'+len);
        entry.appendChild(label);
        entry.appendChild(input);
        document.getElementById('entry_list').appendChild(entry);
        document.getElementById('uv_cnt').value = len + 1;
    };

    map.setView(mapCenter, 13);

    var categoryMap = {};
    var socket = io.connect('http://localhost:3000');
    socket.on('projects', function(projects) {
        socket.on('categories', function(categories) {
            projects.forEach(function(project) {
                var point = L.marker([project.lat, project.lng], {draggable:'true', clickable:'true'}).addTo(map);
                point.data = project;

                point.on('click', function() {
                   updateData(point);
               });

                point.on('dragend', function(){
                    updateData(point);
                });

                point.on('mouseover', function(){
                    var popup = L.popup();
                    content = '';
                    var fields = point.data.customFields;
                    for(i in fields){
                        content += fields[i]['key']+"->"+fields[i]["value"]+"\n";
                    }
                    console.log(content);
                    point.bindPopup(content).openPopup();

                });
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
