var mapCenter = [34.0345474, -118.28396350000001];
var map;
var tile = 'http://{s}.tile.cloudmade.com/bcaf462f30bd4c02a7378b1bc17dd6b6/997/256/{z}/{x}/{y}.png'
var Esri_WorldTopoMap = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';  
var markerArray = new Array();
var markers = new L.layerGroup();
var projectFilter = {};
var iconMap = {};

document.addEventListener('DOMContentLoaded', function() 
{
    map = L.map('map', {center: mapCenter, zoom: 14,/*maxZoom: 15,//minZoom: 9*/});
    L.tileLayer( Esri_WorldTopoMap, {}).addTo(map);
    resize_map();
    var socket = io.connect('http://localhost:3000');

    $('#location_filter').change(function() 
    {
        map.removeLayer(markers);
        markers = new L.layerGroup();
        projectFilter.insideLA = $('#location_filter').val(); 
        socket.emit('projectsRequest', projectFilter);
    });

    $('#filter').keypress(function(e) 
    {
        $('#filter').attr("style",""); //default css on reset (by typing)
        var keyCode = e.keyCode || e.which;
        if (keyCode == '13') {
            map.removeLayer(markers);
            markers = new L.layerGroup();
            projectFilter.name = "/" + $('#filter').val() + "/i";
            socket.emit('projectsRequest', projectFilter);
        }
    });

    $('#filter').click(function() 
    {
        $('#filter').val("");
        $('#filter').attr("style",""); //back to default css
    });

    $('#filters_button').click(function()
    {
        $('#filter').toggle();
        $('#filters_panel').toggle();
        console.log($('#filters_button').text());
        if($('#filters_button').text() == "filters")
        {
            $('#filters_button').text('hide');
        }
        else
        {
            $('#filters_button').text('filters');   
        }

    });

    $('.categories').change(function() 
    {
        projectFilter.categories = [];
        $('.categories').each(function() 
        {
            if ($(this).is(':checked')) 
            {
                projectFilter.categories.push($(this).val());
            }
        });
        map.removeLayer(markers);
        markers = new L.layerGroup();
        socket.emit('projectsRequest', projectFilter);
    });

    updateMap(socket, function() 
    {
        markers.addTo(map);
    });
    socket.emit('projectsRequest', projectFilter);
    L.Util.requestAnimFrame(map.invalidateSize,map,!1,map._container);
}, false);

function updateMap(socket, callback) 
{
    socket.on('projects', function(projects) 
    {
        projects.forEach(function(project) 
        {
            var icon = L.icon(
            {
                iconUrl: '/category/' + project.category + '/image',
                iconSize:     [30, 30], // size of the icon
            });
            var marker = L.marker([project.lat, project.lng], {icon: icon}).addTo(markers);
            marker.project = project;
            marker.project.narrativeTag = "<div><div><strong>" + project.name + ": </strong></br>" + project.narrative + "</div>";
            for (var i = 0; i < marker.project.customFields.length; i++)
            {
                project.narrativeTag += "<div>" + marker.project.customFields[i].key + ": " + marker.project.customFields[i].value + "</div>";  
            }
            marker.project.narrativeTag += "<div>" + marker.project.address + "</div></div>";
            marker.project.imageTag = "";
            
            for (var i = 0; i < marker.project.images.length; i++) 
            {
                var url = '/project/' + marker.project._id + '/image/' + i;
                url = '"' + url + '"';
                marker.project.imageTag = '<div class="lightbox_thumbnail"><a ' + "onclick='lightbox_onclick("  + url + ")'"
                + '><img src=' + url + ' width="100" height="100"></a></div>'; 
            } 
            marker.bindPopup(marker.project.narrativeTag + marker.project.imageTag);
        });
        callback(markers);
    });
}

function resize_map() 
{
    var maxWidth = $(window).width();
    var maxHeight = $(window).height();
    $("#map").width(maxWidth).height(maxHeight-90);
}

$(window).on('resize load', resize_map);

function lightbox_onclick(img_url) 
{
    document.getElementById('lightbox').style.display='inline';
    $("#lightbox_image").attr('src', img_url);
}   
