// id for the map canvas
var mapID = "map-canvas";

// id for resulsts list id
var resultsListID = "results-list";

/*
Gets the parameter of the URL as a string

name - the string representing the name of the parameter you want to retrieve
*/
function getParam(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}

//console.log(urlParam('state'));
/*
initializes the map
*/
function initializeMap() {
	var distance = getParam('distance');
	var address = getParam('addressLine1') + " " + getParam('addressLine2') + ", " + getParam('city') + ", " + getParam('state') + " " + getParam("zipcode");

	//paints map
	var mapOptions = {
		center: new google.maps.LatLng(40.7078, -74.0119),
		zoom: 15
	};
	map = new google.maps.Map($('#' + mapID)[0], mapOptions);
	geocoder = new google.maps.Geocoder();
	service = new google.maps.DistanceMatrixService();

	//deal with applicable vendors
	var vendorList = getVendors();//filterList(getVendors(), distance, address);
	//addVendorsToPage(map, vendorList);
}

google.maps.event.addDomListener(window, 'load', initializeMap);

/*
Adds vendors to the page by:
1. editing the contents of the results list
2. adding a marker

vendorList - a JSON object of the applicable vendors
*/
function addVendorsToPage(map, vendorList){
	var length = vendorList.length;
	for (var i = 0; i < length; i++){
		var vendor = vendorList[i];
		addResultToList(vendor);
		addMarker(getAddress(map, vendor));
	}

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
Gets a JSON object of vendors from the server
*/
function getVendors(){
	var vendorList = [];
	var request = new XMLHttpRequest();
    request.open('GET', '/test.json', true);
	request.addEventListener('load', function(e){
		console.log(request);
	    if (request.status == 200) {
	        // do something with the loaded content
	        var content = request.responseText;
			var data = JSON.parse(content);
		//	console.log(data);
			for (var i = 0; i < data.length; i++){
				vendorList.push(data[i]);
			}

			//console.log(vendorList);

			return vendorList;
	    } else {
	        // something went wrong, check the request status
	        // hint: 403 means Forbidden, maybe you forgot your username?
	        console.log('oops');
	    }
	}, false);
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
	return vendor.address1 + " " + vendor.address2 + ", " + vendor.city + ", " + vendor.state + " " + vendor.zip;
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

/*
Adds a vendor to a HTML list

data - a JSON of the vendor
*/
function addResultToList(data) {
	//for (i=0; i<data.length; i++) {
	    //char to add: name, address, short desc, 
	    var currAddress = "256 Thayer St Providence RI 02906";

	//TO DO: JUST APPENDS SAME THING
	    //add them to the DOM
		var ul = document.getElementById(resultsListID);
		var li = document.createElement('li');
		var id = Math.random(150000); //id of the client
		li.setAttribute('id', id);
		li.setAttribute('onclick', "document.vendorAddress='Skúlagata 28, 101 Reykjavík, Iceland'; moveMapCenter();");
		li.innerHTML = '<div id="icon">icon goes here</div><div id="details"><div id="name">Vendor Name<br></div><div id="address">Skúlagata 28, 101 Reykjavík, Iceland<br></div><div id="desc">some details about the vendor some details about the vendor some details about the vendor<br></div></div>';
		ul.appendChild(li);
	//}
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




