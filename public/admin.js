
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
    document.getElementById("image_injection_div").innerHTML = '';
    for (i in m.data.images) 
    {
        var url = '/project/' + m.data._id + '/image/' + i;
        document.getElementById("image_injection_div").innerHTML += '<div style="float:left; height:60px"><img src="' + url + '" height="52" width="52" required></div><div><input type="file" name="imgFile" style="width:317px"><input type="text" name="imgText" class="imgText" style="width:317px" value="'+ m.data.images[i]['caption'] + '" required></div><br />';
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
            //TODO: HTML needs to be escaped using text() method. DOESN'T WORK. (input: apostrophe or '>'R
            captions_array.push(text_to_html($(this).val()));
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

var text_to_html = function(text)
{
    if (text)
    {
        text = htmlentities(text,'HTML_ENTITIES');
        text = text.replace(/(\n|\r|\r\n)/gi,"<br />\n");
        text = text.replace(/  /gi,"&nbsp;&nbsp;");
    }
    else
    {
        text = '';
    }
    return text;
}

function htmlentities(string, quote_style, charset, double_encode) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: nobbler
    // +    tweaked by: Jack
    // +   bugfixed by: Onno Marsman
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Ratheous
    // +   improved by: Rafa� Kukawski (http://blog.kukawski.pl)
    // +   improved by: Dj (http://phpjs.org/functions/htmlentities:425#comment_134018)
    // -    depends on: get_html_translation_table
    // *     example 1: htmlentities('Kevin & van Zonneveld');
    // *     returns 1: 'Kevin &amp; van Zonneveld'
    // *     example 2: htmlentities("foo'bar","ENT_QUOTES");
    // *     returns 2: 'foo&#039;bar'
    var hash_map = this.get_html_translation_table('HTML_ENTITIES', quote_style),
        symbol = '';
    string = string == null ? '' : string + '';

    if (!hash_map) {
        return false;
    }

    if (quote_style && quote_style === 'ENT_QUOTES') {
        hash_map["'"] = '&#039;';
    }

    string = string.split('&').join('&amp;');

    if (!!double_encode || double_encode == null) {
        for (symbol in hash_map) {
            if (hash_map.hasOwnProperty(symbol)) {
                string = string.split(symbol).join(hash_map[symbol]);
            }
        }
    } else {
        string = string.replace(/([\s\S]*?)(&(?:#\d+|#x[\da-f]+|[a-zA-Z][\da-z]*);|$)/g, function (ignore, text, entity) {
            for (symbol in hash_map) {
                if (hash_map.hasOwnProperty(symbol)) {
                    text = text.split(symbol).join(hash_map[symbol]);
                }
            }

            return text + entity;
        });
    }

    return string;
}

function get_html_translation_table(table, quote_style) {
    // http://kevin.vanzonneveld.net
    // +   original by: Philip Peterson
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: noname
    // +   bugfixed by: Alex
    // +   bugfixed by: Marco
    // +   bugfixed by: madipta
    // +   improved by: KELAN
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Frank Forte
    // +   bugfixed by: T.Wild
    // +      input by: Ratheous
    // %          note: It has been decided that we're not going to add global
    // %          note: dependencies to php.js, meaning the constants are not
    // %          note: real constants, but strings instead. Integers are also supported if someone
    // %          note: chooses to create the constants themselves.
    // *     example 1: get_html_translation_table('HTML_SPECIALCHARS');
    // *     returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
    var entities = {},
        hash_map = {},
        decimal;
    var constMappingTable = {},
        constMappingQuoteStyle = {};
    var useTable = {},
        useQuoteStyle = {};

    // Translate arguments
    constMappingTable[0] = 'HTML_SPECIALCHARS';
    constMappingTable[1] = 'HTML_ENTITIES';
    constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
    constMappingQuoteStyle[2] = 'ENT_COMPAT';
    constMappingQuoteStyle[3] = 'ENT_QUOTES';

    useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
    useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT';

    if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
        throw new Error("Table: " + useTable + ' not supported');
        // return false;
    }

    //entities['38'] = '&amp;';
    if (useTable === 'HTML_ENTITIES') {
        entities['160'] = '&nbsp;';
        entities['161'] = '&iexcl;';
        entities['162'] = '&cent;';
        entities['163'] = '&pound;';
        entities['164'] = '&curren;';
        entities['165'] = '&yen;';
        entities['166'] = '&brvbar;';
        entities['167'] = '&sect;';
        entities['168'] = '&uml;';
        entities['169'] = '&copy;';
        entities['170'] = '&ordf;';
        entities['171'] = '&laquo;';
        entities['172'] = '&not;';
        entities['173'] = '&shy;';
        entities['174'] = '&reg;';
        entities['175'] = '&macr;';
        entities['176'] = '&deg;';
        entities['177'] = '&plusmn;';
        entities['178'] = '&sup2;';
        entities['179'] = '&sup3;';
        entities['180'] = '&acute;';
        entities['181'] = '&micro;';
        entities['182'] = '&para;';
        entities['183'] = '&middot;';
        entities['184'] = '&cedil;';
        entities['185'] = '&sup1;';
        entities['186'] = '&ordm;';
        entities['187'] = '&raquo;';
        entities['188'] = '&frac14;';
        entities['189'] = '&frac12;';
        entities['190'] = '&frac34;';
        entities['191'] = '&iquest;';
        entities['192'] = '&Agrave;';
        entities['193'] = '&Aacute;';
        entities['194'] = '&Acirc;';
        entities['195'] = '&Atilde;';
        entities['196'] = '&Auml;';
        entities['197'] = '&Aring;';
        entities['198'] = '&AElig;';
        entities['199'] = '&Ccedil;';
        entities['200'] = '&Egrave;';
        entities['201'] = '&Eacute;';
        entities['202'] = '&Ecirc;';
        entities['203'] = '&Euml;';
        entities['204'] = '&Igrave;';
        entities['205'] = '&Iacute;';
        entities['206'] = '&Icirc;';
        entities['207'] = '&Iuml;';
        entities['208'] = '&ETH;';
        entities['209'] = '&Ntilde;';
        entities['210'] = '&Ograve;';
        entities['211'] = '&Oacute;';
        entities['212'] = '&Ocirc;';
        entities['213'] = '&Otilde;';
        entities['214'] = '&Ouml;';
        entities['215'] = '&times;';
        entities['216'] = '&Oslash;';
        entities['217'] = '&Ugrave;';
        entities['218'] = '&Uacute;';
        entities['219'] = '&Ucirc;';
        entities['220'] = '&Uuml;';
        entities['221'] = '&Yacute;';
        entities['222'] = '&THORN;';
        entities['223'] = '&szlig;';
        entities['224'] = '&agrave;';
        entities['225'] = '&aacute;';
        entities['226'] = '&acirc;';
        entities['227'] = '&atilde;';
        entities['228'] = '&auml;';
        entities['229'] = '&aring;';
        entities['230'] = '&aelig;';
        entities['231'] = '&ccedil;';
        entities['232'] = '&egrave;';
        entities['233'] = '&eacute;';
        entities['234'] = '&ecirc;';
        entities['235'] = '&euml;';
        entities['236'] = '&igrave;';
        entities['237'] = '&iacute;';
        entities['238'] = '&icirc;';
        entities['239'] = '&iuml;';
        entities['240'] = '&eth;';
        entities['241'] = '&ntilde;';
        entities['242'] = '&ograve;';
        entities['243'] = '&oacute;';
        entities['244'] = '&ocirc;';
        entities['245'] = '&otilde;';
        entities['246'] = '&ouml;';
        entities['247'] = '&divide;';
        entities['248'] = '&oslash;';
        entities['249'] = '&ugrave;';
        entities['250'] = '&uacute;';
        entities['251'] = '&ucirc;';
        entities['252'] = '&uuml;';
        entities['253'] = '&yacute;';
        entities['254'] = '&thorn;';
        entities['255'] = '&yuml;';
    }

    if (useQuoteStyle !== 'ENT_NOQUOTES') {
        entities['34'] = '&quot;';
    }
    if (useQuoteStyle === 'ENT_QUOTES') {
        entities['39'] = '&#39;';
    }
    entities['60'] = '&lt;';
    entities['62'] = '&gt;';

    // ascii decimals to real symbols
    for (decimal in entities) {
        if (entities.hasOwnProperty(decimal)) {
            hash_map[String.fromCharCode(decimal)] = entities[decimal];
        }
    }
    return hash_map;
}
