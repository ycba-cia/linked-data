
	var map;
	var subjects = [];
	var birthPlaces = [];
	var deathPlaces = [];
	var placesOfActivity = [];
	var placesOfVisit = [];
	var latitudes = [];
	var longitudes = [];
	var markers = [subjects,birthPlaces,deathPlaces,placesOfActivity,placesOfVisit];
	var infowindow = null;
	var markerCluster0;
	var markerCluster1;
	var markerCluster2;
	var markerCluster3;
	var markerCluster4;
	var markerClusterArr = [markerCluster0,markerCluster1,markerCluster2,markerCluster3,markerCluster4];
	
	function clear() {
		subjects = [];
		birthPlaces = [];
		deathPlaces = [];
		placesOfActivity = [];
		placesOfVisit = [];
		latitudes = [];
		longitudes = [];
		markers = [subjects,birthPlaces,deathPlaces,placesOfActivity,placesOfVisit];
		infowindow = null;	
	}
	/* check if a marker with the given set of (lat, lng) exists */
	function markerExists(lat, lng)
	{
		var latExists = false;
		var lngExists = false;
		if(latitudes.length == 0)
		{
			return false;
		}
		else
		{
			for(var i = 0; i < latitudes.length; i++)
			{
				if(lat == latitudes[i])
				{
					latExists = true;
				}
			}
			for(var i = 0; i < longitudes.length; i++)
			{
				if(lng == longitudes[i])
				{
					lngExists = true;
				}
			}
			
			if(latExists && lngExists)
			{
				return true;
			}
		}
		return false;
	}
	
	/* returns the latitude from coordinates:"lat,lng" */
	function getLat(str)
	{
		var pos = 0;
		while(str.charAt(pos) != ',')
		{
			pos++;
		}
		return str.substring(0,pos);
	}
	
	/* returns the longitude from coordinates:"lat,lng" */
	function getLong(str)
	{
		var pos = 0;
		while(str.charAt(pos) != ',')
		{
			pos++;
		}
		return str.substring(pos + 1, str.length);
	}
	
	/* returns a string associated with the typeId */
	function getType(typeId)
	{
		if(typeId == 0)
			return "Subjects";
		else if(typeId == 1)
			return "Birth place";
		else if(typeId == 2)
			return "Death place";
		else if(typeId == 3)
			return "Place of Activity";
		else if(typeId == 4)
			return "Place of Visit/Tour";
	}
	
	/* returns a typeId associated with the given type */
	function getTypeId(type)
	{
		if(type == "Subjects")
			return 0;
		else if(type == "Birth place")
			return 1;
		else if(type == "Death place")
			return 2;
		else if(type == "Place of Activity")
			return 3;
		else if(type == "Place of Visit/Tour")
			return 4;
	}
	
	/* add a single marker to the markers array */
	function addMarker(record,typeId)
	{
		var imageUrl = 'http://chart.apis.google.com/chart?cht=mm&chs=24x32&' +
			'chco=FFFFFF,008CFF,000000&ext=.png';

		var markerImage = new google.maps.MarkerImage(imageUrl, null, null, null,
			new google.maps.Size(20, 24));
		
		var myLat = record.Latitude;
		var myLng = record.Longitude;
		
			
			if(markerExists(myLat, myLng)){
				var randomnumber1 = Math.floor(Math.random()*101);  //generates a random number 0-100
				var randomnumber2 = Math.floor(Math.random()*101);
				var offset1 = 0.0001*randomnumber1;
				var offset2 = 0.0001*randomnumber2;
				myLat = parseFloat(myLat) + parseFloat(offset1);
				myLng = parseFloat(myLng) + parseFloat(offset2);
			}
			
			else
			{
				latitudes.push(myLat);
				longitudes.push(myLng);
			}
		
			if(record.Url)
			{
				var contentString = 
				'<div id="bodyContent" class="bodyContent">'+
				'<div class="thumb"><a target="_blank" href='+record.Url+'><img onerror="this.src=\'../interface/themes/ycba/images/noCover3.gif\';"src='+record.Thumb+' /></a></div>'+
				'<div class="urlAuthor"><a href="'+record.Url+'" target="_blank"><i>'+record.Title+'</i></a>'+
				'</div>';
			}
			else      //if url doesn't exist for the record then no link provided
			{
				var contentString = 
				'<div id="bodyContent" class="bodyContent">'+
				'<i>'+record.Title+'</i>'+
				'</div>';
			}
		
			var latLng = new google.maps.LatLng(myLat,
				myLng);
			var marker = new google.maps.Marker({
				position: latLng,
				html: contentString,
				icon: markerImage
			});
			infowindow = new google.maps.InfoWindow({
				content: contentString
			});
			google.maps.event.addListener(marker, 'click', function() {
			infowindow.setContent(this.html);
				infowindow.open(map,this);
			});
			
			markers[typeId].push(marker);
	}
	
	/* add all the events marker of a given record for a given event */
	function addEventsMarkers(record, typeId)
	{
		var i = 0;
		while(record.Events[i] && record.Events[i].type == getType(typeId))
		{
			var coord = record.Events[i].coordinates;
			addMarker(record,coord,typeId);
			i++
		}
	}
	
	/* add all the subjects markers of a given record */
	function addSubjectsMarkers(record)
	{		
		var i = 0;
		while(record.Subjects[i])
		{
			var coord = record.Subjects[i].coordinates;
			addMarker(record,getTypeId("Subjects"));
			i++;
		}
	}
	
	/* add a new markerClusterer to the map which clusters markers of a given typeId */
	function addMarkerCluster(typeId, records)
	{
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			addMarker(record, typeId);
		}
		markerClusterArr[typeId] = new MarkerClusterer(map, markers[typeId]);
	}
	
	/* set up checkboxes for all the types of markers */
	function setCheckBoxes(defaultChecked)
	{
		//ids of checkboxes set as the indices of the options array!! e.g. Subjects checkbox has id = 0
		var options = ["Subjects","Birth place","Death place","Place of Activity","Place of Visit/Tour"];
		$("#checkboxes").empty();
		var toAppend = "";
		for(var i = 0; i < options.length; i++)
		{
			if(options[i] == defaultChecked)
			{
				toAppend = toAppend + '<input type="checkbox" id="'+i+'" checked="checked"/>'+options[i]+'<br />';
			}
			else
			{
				toAppend = toAppend + '<input type="checkbox" id="'+i+'" />'+options[i]+'<br />';
			}
		}	
		$("#checkboxes").append('<form name="form" method="post" action="">'+toAppend+'</form>');
	}
	
	
	/*checkboxes event handler functions.....start...*/
	
	function addEvent(obj, type, fn)
	{
		if (obj.attachEvent)
		{
			obj['e' + type + fn] = fn;
			obj[type + fn] = function(){obj['e' + type + fn](window.event);}
			obj.attachEvent('on' + type, obj[type + fn]);
		}
		else
		obj.addEventListener(type, fn, false);
	}

	function removeEvent( obj, type, fn ) 
	{
		if( obj.detachEvent ) {
		obj.detachEvent( 'on'+type, obj[type+fn] );
		obj[type+fn] = null;
		}
		else
			obj.removeEventListener( type, fn, false );
	}

	// Function below is based on an example get from
	// http://bytes.com/topic/javascript/answers/725305-please-help-javascript-dynamic-checkboxes-events-question

	function fCheckBox(e)
	{
		var id = e.target.id;
		var checked = document.getElementById(id).checked;
		if (checked == true)
		{
			// item was checked.  save new site assignment for this user
			addMarkerCluster(id);
			//alert("Checkbox #id="+id+" was clicked and checked.");
		}
		else
		{
			// item was unchecked.  remove this site assignment for this user
			markerClusterArr[id].clearMarkers();
			//alert("Checkbox #id="+id+" was clicked and unchecked.");
		}
	}

	function addEvents2CheckBox()
	{
		for(var i=0; i<document.form.length; i++)
		{
			addEvent(document.form.elements[i], "click", fCheckBox);
		}
	}

	/*checkboxes event handlers.......end*/
	
	/* main function that is run on initialization */
	function updateMap(records) 
	{
		
        /* can be "Subjects", "Birth place", "Death place", "Place of Activity" 
        	or "Place of Visit/Tour" */
        var defaultMarkers = "Subjects";
		addMarkerCluster(getTypeId(defaultMarkers), records);
		
		//setCheckBoxes(defaultMarkers);
		//addEvents2CheckBox();
    }

	function initMap() {
		var center = new google.maps.LatLng(46.55886,-34.453125);
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 2,
          center: center,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });	
	}