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
var serverURL = "http://localhost:8080/partner_data.json";

// geocoder
var geocoder = new google.maps.Geocoder();

// distance matrix service
var service = new google.maps.DistanceMatrixService();

// Minimum distance for vendors
var distance = 0;

$(document).ready(function(){
	distance = parseInt(getParam('distance'));
})


function getProductCapability() {
	var selected = [];
	$('#prodCap input:checked').each(function() {
	    selected.push($(this).attr('value'));
	});
	console.log("selected product capability: "+selected);
	return selected;
}

function getLead() {
	var selected = [];
	$('#lead input:checked').each(function() {
	    selected.push($(this).attr('value'));
	});
	console.log("selected lead: "+selected);
	return selected;
}

function getPayment() {
	var selected = [];
	$('#payment input:checked').each(function() {
	    selected.push($(this).attr('value'));
	});
	console.log("selected payment: "+selected);
	return selected;
}

//if you click on a box
function updateSearch() {
	initializeMap();
	//clear the list items
	document.getElementById("results-list").innerHTML = "";

}
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
	var address = getAddressFromURL();

	// get vendors
	request.addEventListener('load', function(e){
	    if (request.status == 200) {
	        // do something with the loaded content
	        var content = request.responseText;
			var data = JSON.parse(content);
			renderVendors(limit(data), address);
			console.log("renderVendors was just called");
	    } else {
	        // something went wrong, check the request status
	        // hint: 403 means Forbidden, maybe you forgot your username?
	        console.log('oops');
	    }
	}, false);

	// deal with errors
	request.addEventListener('error', function(e){
		alert('Error: failed to connect to server');
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
Adds a vendor to a HTML list

data - a JSON of a single vendor
*/
function addResultToList(vendor) {
    var vendorName = vendor.name;
    var address1 = vendor.addressLine1;
    var address2 = getAddressLine2(vendor);
    var phone = vendor.phone;
    var id = vendor.id;

    //create DOM elements
    var $li = $("<li>", {
    	class: 'vendorLi',
    });
    var $details = $("<div>", {
    	class: 'details'
    });
    var $name = $("<div>", {
    	class: 'name',
    	text: vendorName
    });
    var $address1 = $("<div>", {
    	class: 'address',
    	text: address1
    });
    var $address2 = $("<div>", {
    	class: 'address',
    	text: address2
    });
    var $phone = $("<div>", {
    	class: 'phone',
    	text: phone
    });
    var $profile = $("<button>", {
    	class: 'profile',
    	text: "Full profile"
    });
    var $map = $("<button>", {
    	class: 'map',
    	text: "Find on map"
    });
    var newURL = window.location.pathname+"../../clientProfile.html";
    $profile.attr('onclick', "window.location.assign('"+newURL+"?id="+id+"'); loadProfile()");
    $map.attr('onclick', "document.vendorAddress='"+address1+" "+address2+"'; moveMapCenter();");
    // add DOM elements to page
    $details.append($name);
    $details.append($address1);
    $details.append($address2);
    $details.append($phone);
    $details.append($profile);
    $details.append($map);
    $li.append($details);
    $("#" + resultsListID).append($li);
}

/*
Adds a marker on the google map at the given address. 
currAddress - a string representing an address
*/


//red: matches requirements but not distance. default
//blue: matches distance but not requirements. http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png
//green: matches distance and requirements. http://www.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png

function addMarker(map, vendor, boundsList) {
	var currAddress = getAddress(vendor);
	geocoder.geocode( { 'address': currAddress}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			console.log("called addMarker");

			//gets the selected search parameters
			var product = getProductCapability();
			var lead = getLead();
			var payment = getPayment();

			//FIX THESE
			var matchesProduct = true;
			var matchesLead = true;
			var matchesPayment = true;

			if (matchesProduct&&matchesLead&&matchesPayment) {
				//green
				iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png';
			}
			else if (matchesProduct) {
				//blue
				iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png';
			}
			else {
				//red
				iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png';
			}
			var location = results[0].geometry.location;
			var marker = new google.maps.Marker({
				map: map,
				//TODO: change the color based on parameters
				icon: iconColor,
				position: location,
    			animation: google.maps.Animation.DROP
			});

			/*
			Popup client profile windows when you click on their map markers.
			*/
			var vendorName = vendor.name;
		    var address1 = vendor.addressLine1;
		    var address2 = getAddressLine2(vendor);
		    var phone = vendor.primaryPhone;
		    var email = vendor.primaryEmail;
		    var website = "fake.com";
		    var capability = vendor.productCapabilityIds;
		    console.log("capability is "+capability);
		    var payment = vendor.paymentTerms.terms;
		    var lead = vendor.leadTime.leadTime;
			var contentString = "<div id='content'>"
			+"<table id='profile'>"
			+"<tr>"
			+"	<td>"
			+"		<div id='non-table'>"
			+"			<div id='name'>"+vendorName+"</div>"
			//+"			<button onclick='window.location.assign('"+newURL+"'); loadProfile()'>Full profile</button>"
			+"			<button onclick='goToProfile("+vendor.id+")'>Full profile</button>"
			+"			<div id='address'>"+address1+"<br>"+address2+"</div>"
			+"			<div id='phone'>Phone: "+phone+"</div>"
			+"			<div id='email'>Email: "+email+"</div>"
			+"			<div id='website'>Website: "+website+"</div>"
			+"		</div>"
			+"	</td>"
			+"	<td>"
			+"		<table border='1'>"
			+"			<tr>"
			+"				<td>Product Capability</td>"
			+"				<td id='prodCap'>"+capability+"</td>"
			+"			</tr>"
			+"			<tr>"
			+"				<td>Payment Method</td>"
			+"				<td id='payment'>"+payment+"</td>"
			+"			</tr>"
			+"			<tr>"
			+"				<td>Lead Time</td>"
			+"				<td id='leadTime'>"+lead+"</td>"
			+"			</tr>"
			+"		</table>"
			+"	</td>"
			+"</tr>"
			+"</div>"

			var infowindow = new google.maps.InfoWindow({
				content: contentString,
				width: 300
			});

			//add event listener so infowindow pops up on click
			google.maps.event.addListener(marker, 'click', function() {
				infowindow.open(map,marker);
				//call the function that fills the info into the profile
				loadProfile();
			});
			boundsList.push(location);
			//set the bounds if we're at the end of the vendor list
			console.log("length of boundsList: "+boundsList.length);
			console.log("length of vendorsList: "+vendorsLength);
			/*problem: that's the length of the full vendors list, not the number of vendors
			that fit the criteria. fix.*/
			//if (boundsList.length==vendorsLength) {
				fitBounds(boundsList);
			//}
		} 
		else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
}

function goToProfile(id) {
	var newURL = window.location.pathname+"../../clientProfile.html?id="+id;
	window.location.assign(newURL);
}

function fitBounds(boundsList) {
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i < boundsList.length; i++) {
  		bounds.extend(boundsList[i]);
  	}
  	map.fitBounds(bounds);
}

/*
Renders filtered vendors on page

vendors - the complete JSON list of vendors
originAddress - a string representing the address of the origin
*/
var vendorsLenth = 0;
function renderVendors(vendors, originAddress){
	vendorsLength = vendors.length;
	var boundsList = [];

	for (var i = 0; i < vendorsLength; i++){
		vendor = vendors[i];
		renderFilteredVendor(originAddress, vendor, boundsList);
	}
}

/*
Renders vendor if:
1. vendor is within distance radius
2. TODO: vendor matches flower types
3. TODO: vendor matches lead time

clientAdress - the client's address as a string
vendor - JSON object representing vendor
*/
function renderFilteredVendor(clientAddress, vendor, boundsList) {
	var vendorAddress = getAddress(vendor);
	service.getDistanceMatrix(
    {
      origins: [clientAddress],
      destinations: [vendorAddress],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.IMPERIAL,
      avoidHighways: false,
      avoidTolls: false
    }, function(response, status){
    	if (status != google.maps.DistanceMatrixStatus.OK) {
    		alert('Error was: ' + status);
		} else {
			//get distance
			var origins = response.originAddresses;
	    	var destinations = response.destinationAddresses;
	    	var totalDist = 0.0;
			for (var i = 0; i < origins.length; i++) {
	    		var results = response.rows[i].elements;
		      	for (var j = 0; j < results.length; j++) {
					totalDist = totalDist + results[j].distance.value;
		      	}
		    }

		    //convert to miles
		    totalDist *= 0.000621371;
		    //console.log(totalDist);
		    // add if passes filter
		    if (filter(totalDist)){
				addResultToList(vendor);
				addMarker(map, vendor, boundsList);
		    }
		}
    });
}

/*
Returns true if the vendor passes the filter/matches the user's query. 
Returns false otherwise

vendorDistance - distance between origin and vendor
*/
function filter(vendorDistance){
	return vendorDistance < distance;
}

/*
Moves the map to the center of the address clicked
*/
function moveMapCenter() {
	console.log("you clicked on the address: " + document.vendorAddress);
	geocoder.geocode( { 'address': document.vendorAddress}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map.setCenter(results[0].geometry.location);
			map.setZoom(10);
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
	return vendor.addressLine1 + ", " + vendor.addressLine2 + ", " + vendor.city + ", " + vendor.state + " " + vendor.zip;
}

function getAddressLine2(vendor){
	return vendor.city + ", " + vendor.state + " " + vendor.zip;
}



//TO DO!!!!!!!=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//this is not written at all it's from Michelle's chatroom lol

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




