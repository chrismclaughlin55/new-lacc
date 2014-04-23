var mapCenter = [34.0345474, -118.28396350000001];
var map;
var tile = 'http://{s}.tile.cloudmade.com/bcaf462f30bd4c02a7378b1bc17dd6b6/997/256/{z}/{x}/{y}.png'
var Esri_WorldTopoMap = 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';  
var markerArray = new Array();
var markers = new L.layerGroup();
var projectFilter = {};
var iconMap = {};
var opts = {
  lines: 11, // The number of lines to draw
  length: 23, // The length of each line
  width: 10, // The line thickness
  radius: 30, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 40, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#000', // #rgb or #rrggbb or array of colors
  speed: 0.8, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: '50%', // Top position relative to parent
  left: '50%' // Left position relative to parent
};
var target;
var spinner;

document.addEventListener('DOMContentLoaded', function() 
{
    map = L.map('map', {center: mapCenter, zoom: 14,minZoom:9/*maxZoom: 15,//minZoom: 9*/});
    L.tileLayer( Esri_WorldTopoMap, {}).addTo(map);
    resize_map();
    target = document.getElementById('spinner');
    spinner = new Spinner(opts);
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
        if (keyCode == '13') { //TODO put red error message on failure
            spinner.spin(target);
            map.removeLayer(markers);
            markers = new L.layerGroup();
            projectFilter.name = "/" + $('#filter').val() + "/i";
            socket.emit('projectsRequest', projectFilter);
        }
    });

    $('#filter').click(function() 
    {
        $('#filter').attr("style",""); //back to default css
    });

    $('#Csv_Download').click(function() 
    {
        var search = '/download/?' + $.param(projectFilter);
        window.location.href = search;
    });

    updateMap(socket, function() 
    {
        markers.addTo(map);
        spinner.stop();
    });
    socket.emit('projectsRequest', projectFilter);
    L.Util.requestAnimFrame(map.invalidateSize,map,!1,map._container);
    $("#filter-categories").multipleSelect(
    {
        placeholder: "Categories", 
        width: 150, 
        onClick:function(view)
        {
            projectFilter.categories = $("#filter-categories").multipleSelect("getSelects");
            map.removeLayer(markers);
            markers = new L.layerGroup();
            socket.emit('projectsRequest', projectFilter);

        },
        onCheckAll:function(view)
        {
            projectFilter.categories = $("#filter-categories").multipleSelect("getSelects");
            map.removeLayer(markers);
            markers = new L.layerGroup();
            socket.emit('projectsRequest', projectFilter);
        } 
    });

    $("#location_radio").multipleSelect(
    {
        placeholder: "Location",
        width: 120, 
        single:true,
        onClick:function(view)
        {
            projectFilter.insideLA = view.value;
            map.removeLayer(markers);
            markers = new L.layerGroup();
            socket.emit('projectsRequest', projectFilter);
            //PARTHA
            //do your backend magic here using the value. Since they can't mess with this, these "value"'s' will always be unique.
            // console.log("Title: " + view.label + ', "value: "' + view.value + ',' + (view.checked ? 'checked' : 'unchecked'));
        }
    });
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
            for (var i = 0; i < marker.project.images.length; i++) {
                var url = '/project/' + marker.project._id + '/image/' + i;
                url = '"' + url + '"';
                marker.project.imageTag += '<div class="lightbox_thumbnail"><a ' + "onclick='lightbox_onclick("  + url + ")'"
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
    $("#map").width(maxWidth).height(maxHeight-95);
}

$(window).on('resize load', resize_map);

function lightbox_onclick(img_url) 
{
    document.getElementById('lightbox').style.display='inline';
    $("#lightbox_image").attr('src', img_url);
}   
