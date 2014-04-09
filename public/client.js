/*
TODO
1. edit database to match what mike sent over.
*/

// id for the map canvas
var mapID = "map-canvas";

// id for resulsts list id
var resultsListID = "results-list";

// link to the server
var serverURL = "http://localhost:8080/search.json";

/*
Gets the parameter of the URL as a string

name - the string representing the name of the parameter you want to retrieve
*/
function getParam(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}

/*
Returns a string of the address by parsing the URL parameters.
*/
function getAddressFromURL(){
	var address = getParam('addressLine1') + " " + getParam('addressLine2') + ", " + getParam('city') + ", " + getParam('state') + " " + getParam("zipcode");
	return address.replace(new RegExp("\\+", 'g'), " ")
}

//console.log(urlParam('state'));
/*
initializes the map
*/
function initializeMap() {
	var distance = getParam('distance');
	var address = getAddressFromURL();
	
	//paints map
	var mapOptions = {
		center: new google.maps.LatLng(40.7078, -74.0119),
		zoom: 15
	};
	map = new google.maps.Map($('#' + mapID)[0], mapOptions);
	geocoder = new google.maps.Geocoder();
	service = new google.maps.DistanceMatrixService();

	//deal with applicable vendors
	loadVendors(map);
}

google.maps.event.addDomListener(window, 'load', initializeMap);

/*
Gets a JSON object of vendors from the server
*/
function loadVendors(map){
	var request = new XMLHttpRequest();

	// get vendors
	request.addEventListener('load', function(e){
		console.log("blah");
	    if (request.status == 200) {
	        // do something with the loaded content
	        var content = request.responseText;
			var data = JSON.parse(content);
			renderVendors(map, data);
	    } else {
	        // something went wrong, check the request status
	        // hint: 403 means Forbidden, maybe you forgot your username?
	        console.log('oops');
	    }
	}, false);

	// deal with errors
	request.addEventListener('error', function(e){
		console.log('error');
	}, false);

	// initiate connection
	request.open('GET', serverURL, true);
	request.send();
}

/*
Adds vendors to the page by:
1. editing the contents of the results list
2. adding a marker

map - 
vendorList - a JSON object of the applicable vendors
*/
function renderVendors(map, vendorList){
	var length = vendorList.length;

	for (var i = 0; i < length; i++){
		var vendor = vendorList[i];
		addResultToList(vendor);
		//addMarker(map, vendor);
	}
}

/*
Adds a vendor to a HTML list

data - a JSON of a single vendor
*/
function addResultToList(vendor) {
	console.log('here');
    var vendorName = vendor.name;
    var address = getAddress(vendor);
    var phone = vendor.phone;

    //create DOM elements
    var $li = $("<li>", {
    	class: 'vendorLi',
    });
	$li.attr('onclick', "document.vendorAddress='"+address+"'; moveMapCenter();");
    var $details = $("<div>", {
    	class: 'details'
    });
    var $name = $("<div>", {
    	class: 'name'
    	//text: vendorName
    });
    var $address = $("<div>", {
    	class: 'address'
    //	text: address
    });
    var $phone = $("<div>", {
    	class: 'phone'
    	//text: phone
    });

    // add DOM elements to page
    $details.append(name);
    $details.append(address);
    $details.append(phone);
    $li.append($details);
    $("#" + resultsListID).append($li);
}

/*
Adds a marker on the google map at the given address. 
currAddress - a string representing an address
*/
function addMarker(map, currAddress) {
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

/*
Returns the distance between the client and vendor address.

clientAdress - the client's address as a string
vendorAddress - the vendor's address as a string
*/
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

/*
Returns a JSON object of vendors within x miles from origin

vendors - the complete JSON list of vendors
distance - the number representing the minimum distance required
originAddress - a string representing the address of the origin
*/
function filterList(vendors, distance, originAddress){
	var filteredList = [];
	var vendorsLength = vendors.length;

	for (var i = 0; i < vendorsLength; i++){
		var vendor = venders[i];
		if (calcDistance(originAddress, getAddress(vendor)) < distance){
			filteredList.push(vendor);
		}
	}

	return filteredList;
}

/*
Given a JSON object of a vendor, returns the vendor's address as a string
*/
function getAddress(vendor){
	return vendor.addressLine1 + ", " + vendor.city + ", " + vendor.state + " " + vendor.zip;
}


//needs to be broken into helper methods
function returnResults() {
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




