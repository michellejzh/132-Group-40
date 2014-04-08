// id for the map canvas
var mapID = "map-canvas";

/*
initializee the map
*/
function initializeMap() {
	var mapOptions = {
		center: new google.maps.LatLng(40.7078, -74.0119),
		zoom: 15
	};
	map = new google.maps.Map($('#' + mapID)[0], mapOptions);
	geocoder = new google.maps.Geocoder();
	service = new google.maps.DistanceMatrixService();
}

google.maps.event.addDomListener(window, 'load', initializeMap);



function calcDistance(clientAddress, vendorAddress) {
  service.getDistanceMatrix(
    {
      origins: [clientAddress, vendorAddress],
      destinations: [clientAddress, vendorAddress],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.IMPERIAL,
      avoidHighways: false,
      avoidTolls: false
    }, callback);
}

function callback(response, status) {
	if (status != google.maps.DistanceMatrixStatus.OK) {
    	alert('Error was: ' + status);
	} 
	else {
		var origins = response.originAddresses;
    	var destinations = response.destinationAddresses;
    	var totalDist = 0;
		for (var i = 0; i < origins.length; i++) {
    		var results = response.rows[i].elements;
    		addMarker(origins[i], false);
	      	for (var j = 0; j < results.length; j++) {
				totalDist = totalDist + results[j].distance.value;
	      	}
	    }
	    //convert to miles
	    totalDist = 0.000621371*totalDist
	    alert(totalDist+" miles");
	}
}


function moveMapCenter() {
	console.log(document.vendorAddress);
	geocoder.geocode( { 'address': document.vendorAddress}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map.setCenter(results[0].geometry.location);
		} 
		else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
}

//needs to be broken into helper methods
function returnResults() {
	addResultsToList();

	//get the results to return
	//THIS MEANS: REPLACE SEARCH.JSON WITH EACH SEARCH
		//do we need search IDs?
	var request = new XMLHttpRequest();
    request.open('GET', '/search.json', true);
    request.addEventListener('load', function(e){
    	console.log(request.status);
        if (request.status == 200) {
            var content = request.responseText;
            var data = JSON.parse(content);
            console.log(data);
            addResultsToList(data);
        }
    }, false);
}

function addResultsToList(data) {
	//for (i=0; i<data.length; i++) {
	    //char to add: name, address, short desc, 
	    var currAddress = "256 Thayer St Providence RI 02906";

	//TO DO: JUST APPENDS SAME THING
	    //add them to the DOM
		var ul = document.getElementById("results-list");
		var li = document.createElement('li');
		var id = Math.random(150000); //id of the client
		li.setAttribute('id', id);
		li.setAttribute('onclick', "document.vendorAddress='Skúlagata 28, 101 Reykjavík, Iceland'; moveMapCenter();");
		li.innerHTML = '<div id="icon">icon goes here</div><div id="details"><div id="name">Vendor Name<br></div><div id="address">Skúlagata 28, 101 Reykjavík, Iceland<br></div><div id="desc">some details about the vendor some details about the vendor some details about the vendor<br></div></div>';
		ul.appendChild(li);
		addMarker(currAddress);
	//}
}

function addMarker(currAddress) {
	geocoder.geocode( { 'address': currAddress}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			var marker = new google.maps.Marker({
				map: map,
				position: results[0].geometry.location
			});
		} 
		else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
}



//TO DO~~~~~~~~~~~~~~~~~~~~~~~~~
function validateForm() {
    var form = document.getElementById("roomName-form");
        form.addEventListener('submit', function(e) {
            if (this.roomName.value.length==0) {
                document.getElementById("roomName-err").style.display = "block";
                e.preventDefault();
            }
            else {
                document.getElementById("roomName-err").style.display = "none";
                e.preventDefault();
                window.location.assign(document.URL+"/messages/"+this.roomName.value);
            }
        });
}




