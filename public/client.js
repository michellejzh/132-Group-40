// id for the map canvas
var mapID = "map-canvas";

// id for resulsts list id
var resultsListID = "results-list";

// use to get the url parameters
var urlParam = function(name){
    var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
    return results[1] || 0;
}

console.log(urlParam('state'));
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
	geocoder = new google.maps.Geocoder();
	service = new google.maps.DistanceMatrixService();

	//deal with applicable vendors
	//var vendorList = filterList(getVendors());
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
	var request = new XMLHttpRequest();
	request.addEventListener('load', function(e){
		console.log("blah");
	    if (request.status == 200) {
	    	alert("aha!");
	        // do something with the loaded content
	        var content = request.responseText;
			var data = JSON.parse(content);
            console.log(data);
            addResultsToList(data);

	    } else {
	        // something went wrong, check the request status
	        // hint: 403 means Forbidden, maybe you forgot your username?
	        console.log('oops');
	    }
	}, false);
	request.addEventListener('error', function(e){
		console.log('error');
	}, false);

	console.log("test");
	request.open('GET', '/search.json', true);
	request.send();
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

data - a JSON of the search results
*/
function addResultsToList(data) {
	for (i=0; i<data.length; i++) {
	    //char to add: name, address, short desc, 
	    var vendorName = data[i].vendorName;
	    //var address = data[i].address+", "+data[i].row.city+", "+data[i].row.state+" "+data[i].row.zipcode;
	    var address = data[i].address;
	    var phone = data[i].phone;

	    //add them to the DOM
		var ul = document.getElementById("results-list");
		var li = document.createElement('li');
		li.setAttribute('onclick', "document.vendorAddress='"+address+"'; moveMapCenter();");
		li.innerHTML = '<div id="icon">[icon goes here]</div><div id="details"><div id="name">'+vendorName+'<br></div><div id="address">'+address+'<br></div><div id="phone">'+phone+'<br></div></div>';
		ul.appendChild(li);
	}
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




