
/* Esri Map Loading */
var mapCenter = [34.0345474, -118.28396350000001];
var map;
var cloudmade = 'http://{s}.tile.cloudmade.com/bcaf462f30bd4c02a7378b1bc17dd6b6/997/256/{z}/{x}/{y}.png';
var Esri_WorldStreetMap = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
var Esri_WorldTopoMap = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';

// Need to refactor this code to make more elegant. This looks like garbage.              
var updateData = function (m) 
{
    $('#project_name').val(m.data.name);
    $('#project_category').val(m.data.category);
    $('#project_narrative').val(m.data.narrative);
    $('#project_address').val(m.data.address);
    $('#project_lat').val(m.getLatLng().lat);
	$('#project_lng').val(m.getLatLng().lng);
    $('.p_id').val(m.data._id);

    if ($('.p_id').val()) 
    {
        $('#delete_button').show();
    } 
    else 
    {
        $('#delete_button').hide();
    }
    
    var matches = document.querySelectorAll('#entry_list .user_label');

    for (var i = 0; i < matches.length; ++i) 
    {
        matches.item(i).parentNode.parentNode.removeChild(matches.item(i).parentNode);
    }
    document.getElementById("custom_field_injection_div").innerHTML = '';
    for(i in m.data.customFields)
    {
        document.getElementById("custom_field_injection_div").innerHTML +='<input name="custom_field_key" type="text" value="'+m.data.customFields[i]['key'] + '"class="field_key"><textarea name="custom_field_value" class="field_value" type="text" ">' + m.data.customFields[i]['value'] + '</textarea>';
    }
    document.getElementById("image_injection_div");
    for (i in m.data.images) 
    {
        console.log(m.data.images);
        document.getElementById("image_injection_div").innerHTML += '<img src="'+ m.data.images[i]['picture'] + '" alt="Smiley face" height="42" width="42"><input type="file" name="imgFile"><input type="text" name="imgText" class="imgText" value="'+ m.data.images[i]['caption'] + '" required>';
    }
}

document.addEventListener('DOMContentLoaded', function() 
{
    var socket = io.connect('http://localhost');
    map = L.map('map').setView(mapCenter, 13);

    L.tileLayer(Esri_WorldTopoMap, 
    {
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    $('#delete_button').hide();
    document.getElementById("add_point").onclick = points;
    function points() 
    {
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
        var newMarker = L.marker(map.getCenter(), {icon: ic, draggable:'true', clickable:'true'});

        newMarker.data = 
        {
            _id: '',
            name: '',
            category: '',
            narrative: '',
            address: '',

            coords: 
            {
                point: 
                {
                    lat: newMarker.getLatLng().lat,
                    lng: newMarker.getLatLng().lng
                }
            }
        };
        updateData(newMarker);

        newMarker.on('dragend', function(e) 
        {
            updateData(newMarker);
        });
        newMarker.addTo(map);
    };

    document.getElementById("add_entry").onclick = function() 
    {
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
    };

    map.setView(mapCenter, 13);

    var categoryMap = {};
    var socket = io.connect('http://localhost:3000');
    socket.on('projects', function(projects) 
    {
        projects.forEach(function(project) 
        {
            var point = L.marker([project.lat, project.lng], {draggable:'true', clickable:'true'}).addTo(map);
            point.data = project;
            point.on('click', function() 
            {
                updateData(point);
            });
            point.on('dragend', function()
            {
                updateData(point);
            });
            point.on('click', function()
            {
                var popup = L.popup();
                content = '';
                if (point.images) 
                {
                    content += point.images[0];
                }
                point.bindPopup(content).openPopup();
            });
        });
	});
    socket.emit('projectsRequest');
    socket.on('categories', function(categories) 
    {
        //Do Category Stuff Here;
    });
    socket.emit('categoriesRequest');
}, false);

/* UX */
$(function() 
{
    $("#radio").buttonset();
});

$(function(){
    $('#add_point_radio').click(function() 
    {
        $('#add_point_panel').show();
        $('#edit_category_panel').hide(); 
        $('#database_panel').hide();
    });
});

$(function() {
    $('#edit_category_radio').click(function()
    {
        $('#add_point_panel').hide();
        $('#edit_category_panel').show();
        $('#database_panel').hide();     
        $('#new_category').focus(); //necessary??? 
    });
});

$(function() {
    $('#database_radio').click(function()
    {
        $('#add_point_panel').hide();
        $('#edit_category_panel').hide();
        $('#database_panel').show();
    });
});

  $(function(){
    $('#add_point').click(function() 
    {
        $('#add_point').disabled = true;
        $(this).css("background", "#1e2506");
        $(this).css("color", "#ddddde");
        $("#add_point").wrap(function() 
        {
            return '<div id="disabled_div"></div>';
        });
    });
});

var custom_field = '<input name="custom_field_key" type="text" placeholder="Key" class="field_key"><textarea rows="4" cols="50" name="custom_field_value" class="field_value" type="text" placeholder="Value"></textarea>';
$(function()
{
    $('#add_entry').click(function() 
    {
        $("#custom_field_injection_div").append(custom_field);
    });
});

var image_html = '<input type="file" name="imgFile"><input type="text" name="imgText" class="imgText" placeholder="Image caption" required>';
$(function() 
{
    $('#add_image').click(function() 
    {
        $("#image_injection_div").append(image_html);
    });
});

$(function()
{
    $('#new_category').on('keyup',function() 
    {
        if($('#new_category').val().length != 0) 
        {
            $('#update_cat').removeAttr("disabled");
        }
        else 
        {
            $('#update_cat').attr("disabled", "disabled");
        }
    });
});

$(function()
{
    $('#img_upload_button').click(function () 
    {
        $('#img_submit_button').show();
    });
});

$(function()
{ 
    $('#submit_button_id').click(function () 
    {
        var captions_array = [];
        $(".imgText").each(function(i)
        {
            captions_array.push($(this).val());
        });
    });
});

$(function()
{
    $("#database_category").change(function() 
    {
	    if($('#database_category').val() == 'import') 
        {
	        $('#import_form').show();
            $('#export_form').hide();
	  	    $('#register_user_form').hide();
        } 
        else if ($('#database_category').val() == 'export') 
        {
	  	    $('#import_form').hide();
	  	    $('#export_form').show();
	  	    $('#register_user_form').hide();
	    } 
        else if ($('#database_category').val() == 'register_user') 
        {
	  	    $('#import_form').hide();
	  	    $('#export_form').hide();
	  	    $('#register_user_form').show();
	    }
    });
});
