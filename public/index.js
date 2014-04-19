var mapCenter = [34.0345474, -118.28396350000001];
var map;
var tile = 'http://{s}.tile.cloudmade.com/bcaf462f30bd4c02a7378b1bc17dd6b6/997/256/{z}/{x}/{y}.png'
var Esri_WorldTopoMap = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';  
var markers = new L.layerGroup();
var markerArray = new Array();

document.addEventListener('DOMContentLoaded', function() 
{
    map = L.map('map', {center: mapCenter, zoom: 14,/*maxZoom: 15,//minZoom: 9*/});

    $('#filter').keypress(function(e)
    {
        $('#filter').attr("style",""); //default css on reset (by typing)
        var keyCode = e.keyCode || e.which;
        if (keyCode == '13') //enter key
        {
            var string = document.getElementById('filter').value;
            var regex = new RegExp(string, 'i');
            map.removeLayer(markers);
            markers = new L.layerGroup();
            var found = false;
            markerArray.forEach(function(project) 
            {
                if (regex.test(project.name)) 
                {
                    found = true;
                    marker =  L.marker([project.lat, project.lng]);
                    marker.project = project;
                    marker.bindPopup(marker.project.narrativeTag + marker.project.imageTag);
                    marker.addTo(markers);
                }
                 markers.addTo(map);
            });
            if (found == false)
            {
                $('#filter').val("No results found");
                $('#filter').attr("style","color:red");
                document.getElementById("filter").setSelectionRange(0, 16); 
                markerArray.forEach(function(project) 
                {
                    marker =  L.marker([project.lat, project.lng]);
                    marker.project = project;
                    marker.bindPopup(marker.project.narrativeTag + marker.project.imageTag);
                    marker.addTo(markers);
                    markers.addTo(map);
                });
            }
            else 
            {
                $('#filter').val("");
            }
        }
    });

    $('#filter').click(function()
    {
        $('#filter').val("");
        $('#filter').attr("style",""); //back to default css
    });

    markers.addTo(map);

    L.tileLayer( Esri_WorldTopoMap, {}).addTo(map);
    resize_map();
    var categoryMap = {};
    var socket = io.connect('http://localhost:3000');

    socket.on('projects', function(projects) 
    {
        projects.forEach(function(project) 
        {
            var marker = L.marker([project.lat, project.lng]).addTo(markers);
            markerArray.push(project);
            marker.project = project;
            project.narrativeTag = "<div><div><strong>" + project.name + ": </strong></br>" + project.narrative + "</div>";
            for (var i = 0; i < marker.project.customFields.length; i++)
            {
                project.narrativeTag += "<div>" + marker.project.customFields[i].key + ": " + marker.project.customFields[i].value + "</div>";  
            }
            project.narrativeTag += "<div>" + marker.project.address + "</div></div>";
            marker.project.imageTag = "";
            
            for (var i = 0; i < marker.project.images.length; i++) 
            {
                var url = '/project/' + marker.project._id + '/image/' + i;
                url = '"' + url + '"';
                marker.project.imageTag = '<div class="lightbox_thumbnail"><a ' + "onclick='lightbox_onclick("  + url + ")'"
                + '><img src=' + url + ' width="100" height="100"></a></div>'; 
            } 
            
            marker.bindPopup(marker.project.narrativeTag + marker.project.imageTag);
            if (categoryMap[project.category]) 
            {
                categoryMap[project.category].push(marker);    
            }
            else 
            {
                categoryMap[project.category] = [marker];
            }
        });
    });

    socket.emit('projectsRequest');
    socket.on('categories', function(categories) 
    {
        var overLayMap = {};
        categories.forEach(function(category) 
        {
            overLayMap[category.name] = L.layerGroup(categoryMap[category._id]);
        });
        L.control.layers(null, overLayMap).addTo(map);
    });
    socket.emit('categoriesRequest');
    L.Util.requestAnimFrame(map.invalidateSize,map,!1,map._container);
    }, false);

function resize_map()
{
    var maxWidth = $(window).width();
    var maxHeight = $(window).height();
    $("#map").width(maxWidth).height(maxHeight-90);
}

$(window).on('resize load', resize_map );

function lightbox_onclick(img_url) 
{
    document.getElementById('lightbox').style.display='inline';
    $("#lightbox_image").attr('src', img_url);
}   
