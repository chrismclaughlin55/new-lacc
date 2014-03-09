var mapCenter = [34.0345474, -118.28396350000001];
var map;
var cloudmade = 'http://{s}.tile.cloudmade.com/bcaf462f30bd4c02a7378b1bc17dd6b6/997/256/{z}/{x}/{y}.png';
var Esri_WorldStreetMap = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
var Esri_WorldTopoMap = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
/*

*/                      
var updateData = function (m) {
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
    for (var key in m.data.user_values) {
        if (m.data.user_values.hasOwnProperty(key)) {
            var entry = document.createElement('li');
            var label = document.createElement('input');
            label.setAttribute('type', 'text');
            label.setAttribute('placeholder', 'Label');
            label.setAttribute('class', 'user_label');
            label.setAttribute('name', 'user_label'+len);
            label.value = key;
            var input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('placeholder', 'Value');
            input.setAttribute('class', 'user_value');
            input.setAttribute('name', 'user_value'+len);
            input.value = m.data.user_values[key];
            entry.appendChild(label);
            entry.appendChild(input);
            document.getElementById('entry_list').appendChild(entry);
        }
    }
    document.getElementById('image_cnt').value = 0;
    for (var key in m.data.image_path) {
        if (m.data.user_values.hasOwnProperty(key)) {
            var len = document.getElementById('image_cnt').value;
            var entry = document.createElement('li');
            var label = document.createElement('input');
            label.setAttribute('type', 'text');
            label.setAttribute('placeholder', 'Label');
            label.setAttribute('class', 'image_label');
            label.setAttribute('name', 'image_label'+len);
            label.value = key;
            var input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('class', 'image_path');
            input.setAttribute('name', 'image_path'+len);
            input.value = m.data.user_values[key];
            entry.appendChild(label);
            entry.appendChild(input);
            document.getElementById('entry_list').appendChild(entry);
            document.getElementById('image_cnt').value = parseInt(len) + 1;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var socket = io.connect('http://localhost');
    map = L.map('map').setView(mapCenter, 13);


    L.tileLayer(Esri_WorldTopoMap, {
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    document.getElementById("add_point").onclick = points;
  //  document.getElementById("edit_point").onclick = points;
    function points() {




        var pinIcon = L.icon({   
            iconUrl: '/pin.png',

        iconSize:     [38, 95], // size of the icon
        shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
        var greenIcon = L.icon({   
            iconUrl: '/leaf-green.png',
            shadowUrl: 'leaf-shadow.png',

        iconSize:     [38, 95], // size of the icon
        shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

        var redIcon = L.icon({
            iconUrl: '/leaf-red.png',
            shadowUrl: 'leaf-shadow.png',

        iconSize:     [38, 95], // size of the icon
        shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

        var orangeIcon = L.icon({
            iconUrl: '/leaf-orange.png',
            shadowUrl: 'leaf-shadow.png',

        iconSize:     [38, 95], // size of the icon
        shadowSize:   [50, 64], // size of the shadow
        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

        var ic = pinIcon;

        var newMarker =
        L.marker(map.getCenter(), {icon: ic, draggable:'true'});

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

        newMarker.on('click', function(e) {
            updateData(newMarker);
        });
        if(document.getElementById("add_point").value =="add_point")
            console.log("add point value = add_point")
        if(document.getElementById("add_point").value =="edit_point")
            console.log("add point value = edit_point")
            newMarker.addTo(map);
    };


/* TODO Not Implemented yet in UI
    document.getElementById("add_image").onclick = function() {
        var len = document.querySelectorAll('#entry_list .image_label').length;
        var entry = document.createElement('li');
        var label = document.createElement('input');
        label.setAttribute('type', 'text');
        label.setAttribute('placeholder', 'Image Name');
        label.setAttribute('class', 'image_label');
        label.setAttribute('name', 'image_label'+len);
        var input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('class', 'image_path');
        input.setAttribute('name', 'image_path'+len);
        entry.appendChild(label);
        entry.appendChild(input);
        document.getElementById('entry_list').appendChild(entry);
        document.getElementById('image_cnt').value = len + 1;
    }

*/
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

    var newMarker =
    L.marker(map.getCenter(), {color: 'red', draggable:'true'});

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


    }
    document.getElementById("update_cat").onclick = function() {
        var children = document.getElementById('category_list').children;
        var updated_cats = [];
        for (var i = 0; i < children.length; ++i) {
            var inp = children[i].firstChild;
            var k = inp.getAttribute('data-cat-old');
            var v = inp.value
            updated_cats.push({old_cat: k, new_cat: v});
            if (k != v) {
                inp.setAttribute('data-cat-old', v);
                var sel =
                document.getElementById('project_category').children;
                for (var j = 0; j < sel.length; ++j) {
                    if (sel[j].value == k) {
                        sel[j].value = v;
                        sel[j].innerHTML = v;
                        break;
                    }
                }
            }
        }
        testing = updated_cats;

        socket.emit('updateCategories', updated_cats);
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function positionFound(position) {
                mapCenter = [position.coords.latitude, position.coords.longitude];
            });
    }
    map.setView(mapCenter, 13);

    var cat_names = [];

    socket.on('mapData', function(mapData) {
        mapData.forEach(function(d) {
            var newMarker = L.marker([d.coords.point.lat, d.coords.point.lng], {draggable:'true'});
            newMarker.data = d;
            newMarker.on('click', function(e) {
                updateData(newMarker);
            });
            newMarker.on('dragend', function(e) {
                updateData(newMarker);
            });
            newMarker.addTo(map).bindPopup(d.name);
            newMarker.on('mouseover', function(e) {
                newMarker.openPopup();
            });
            newMarker.on('mouseout', function(e) {
                newMarker.closePopup();
            });


        });
    });

    socket.emit('mapDataRequest', mapCenter);
}, false);
