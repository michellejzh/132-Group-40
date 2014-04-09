/*
TODO
1. edit database to match what mike sent over.
2. cache locations so that geolocation thing doesn't send too many queries
*/

// id for the map canvas
var mapID = "map-canvas";

// id for resulsts list id
var resultsListID = "results-list";

// link to the server
var serverURL = "http://localhost:8080/search.json";

// geocoder
var geocoder = new google.maps.Geocoder();

// distance matrix service
var service = new google.maps.DistanceMatrixService();

// list of filtered results
var filteredList = [];

// Minimum distance for vendors
var distance = 0;

// A vendor
var vendor = null;

var count = 0;

var filteredCount = 0;

var ready = false;

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

/*
initializes the map
*/
function initializeMap() {
	
	//paints map
	var mapOptions = {
		center: new google.maps.LatLng(40.7078, -74.0119),
		zoom: 15
	};
	map = new google.maps.Map($('#' + mapID)[0], mapOptions);

	//deal with applicable vendors
	loadVendors(map);
}

google.maps.event.addDomListener(window, 'load', initializeMap);

/*
Gets a JSON object of vendors from the server
*/
function loadVendors(map){
	var request = new XMLHttpRequest();
	distance = parseInt(getParam('distance'));
	var address = getAddressFromURL();

	var testOrigin = "115 Waterman St, Providence, RI 02912";

	// get vendors
	request.addEventListener('load', function(e){
		console.log("blah");
	    if (request.status == 200) {
	        // do something with the loaded content
	        var content = request.responseText;
			var data = JSON.parse(content);
			filterList(limit(data), testOrigin);
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
TODO: THIS FUNCTION SHOULD EVENTUALLY BE DELETED
*/
function limit(vendorList){
	var length = 10;
	var toRet = [];
	for (var i = 0; i < length; i++){
		toRet.push(vendorList[i]);
	}
	return toRet;
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

		// deal with rendering
		addResultToList(vendor);
		addMarker(map, getAddress(vendor));
	}
}

/*
Adds a vendor to a HTML list

data - a JSON of a single vendor
*/
function addResultToList(vendor) {
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
    	class: 'name',
    	text: vendorName
    });
    var $address = $("<div>", {
    	class: 'address',
    	text: address
    });
    var $phone = $("<div>", {
    	class: 'phone',
    	text: phone
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
				position: results[0].geometry.location,
    			animation: google.maps.Animation.DROP
			});
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
function filterList(vendors, originAddress){
	var vendorsLength = vendors.length;

	for (var i = 0; i < vendorsLength; i++){
		vendor = vendors[i];
		calcDistance(originAddress, vendor);
		count += 1;
	}

	ready = true;
}

/*
Returns the distance between the client and vendor address.

clientAdress - the client's address as a string
distance - the number representing the minimum distance required
filteredList - list of vendors matching the query
vendor - JSON object representing vendor
*/
function calcDistance(clientAddress, vendor) {
	var vendorAddress = getAddress(vendor);
	service.getDistanceMatrix(
    {
      origins: [clientAddress, vendorAddress],
      destinations: [clientAddress, vendorAddress],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.IMPERIAL,
      avoidHighways: false,
      avoidTolls: false
    }, function(response, status){
    	if (status != google.maps.DistanceMatrixStatus.OK) {
    		alert('Error was: ' + status);
		} else {
			var origins = response.originAddresses;
	    	var destinations = response.destinationAddresses;
	    	var totalDist = 0;
			for (var i = 0; i < origins.length; i++) {
	    		var results = response.rows[i].elements;
		      	for (var j = 0; j < results.length; j++) {
					totalDist = totalDist + results[j].distance.value;
		      	}
		    }
		    //convert to miles
		    totalDist = 0.000621371*totalDist;
		    if (totalDist < distance){
		   		console.log(totalDist + " " + distance);
		    	console.log(vendor);
		    	filteredList.push(vendor);
		    }
		    filteredCount += 1
		}

		if (ready && filteredCount === count){
			renderVendors(map, filteredList);
		}
    });
}

/*
Determines whether or not a vendor is within the given distance.
If so, it is added to the filteredList
*/
function distanceCallback(response, status) {
	if (status != google.maps.DistanceMatrixStatus.OK) {
    	alert('Error was: ' + status);
	} else {
		var origins = response.originAddresses;
    	var destinations = response.destinationAddresses;
    	var totalDist = 0;
		for (var i = 0; i < origins.length; i++) {
    		var results = response.rows[i].elements;
	      	for (var j = 0; j < results.length; j++) {
				totalDist = totalDist + results[j].distance.value;
	      	}
	    }
	    //convert to miles
	    totalDist = 0.000621371*totalDist;
	    if (totalDist < distance){
	    	//TODO FIGURE THIS OUT
	    }
	}
}

/*
Moves the map to the center of the address clicked
*/
function moveMapCenter() {
	console.log("you clicked on the address: " + document.vendorAddress);
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
Given a JSON object of a vendor, returns the vendor's address as a string
*/
function getAddress(vendor){
	return vendor.addressLine1 + ", " + vendor.city + ", " + vendor.state + " " + vendor.zip;
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




