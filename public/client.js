/*
TODO
1. edit database to match what mike sent over.
2. cache locations so that geolocation thing doesn't send too many queries
*/

// id for the map canvas
var mapID = "map-canvas";

// id for resulsts list id
var resultsListID = "results-list";

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
	$('#product input:checked').each(function() {
	    selected.push($(this).attr('value'));
	});
	console.log("selected product capability: "+selected);
	return selected;
}

function getLead() {
	return $('#delivery input:checked').attr('value');
}

function getPayment() {
	return $('#payment input:checked').attr('value');
}

function getMatches() {
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
	var address = getAddressFromURL();
	$.ajax({
		url:"http://maps.googleapis.com/maps/api/geocode/json?address="+address+"&sensor=false",
		type: "POST",
		success:function(res){
		    var lat = res.results[0].geometry.location.lat;
		    var lng = res.results[0].geometry.location.lng;
			renderVendors(partner_data, [lat, lng]);
		}
	});
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

		    var product = vendor.productCapabilityIds;
		    console.log("product capability is "+product);
		    var payment = vendor.paymentTerms.terms;
		    console.log("payment is "+payment);
		    var lead = vendor.leadTime.leadTime;
		    console.log("lead is "+lead);

			//gets the selected search parameters
			var productParam = getProductCapability();
			var leadParam = getLead();
			var paymentParam = getPayment();
			var matchesParam = getMatches();
			//now check to see whether the vendor matches the parameters
			var matchesProduct = true;
			var matchesLead = lead==leadParam;
			var matchesPayment = payment==paymentParam;

			if (matchesProduct&&matchesLead&&matchesPayment) {
				//green
				var iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png';
				var color = 'green';
			}
			else if (matchesProduct) {
				//blue
				var iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png';
				var color = 'blue';
			}
			else {
				//just matches distance - red
				var iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png';
				var color = 'red';
			}

			var matchesColor = false;
			for (i=0;i<matchesParam.length;i++) {
				console.log(matchesParam[i]);
				if (color==matchesParam[i]) {
					console.log("matches a color!");
					var matchesColor = true;
				}
			}

			if (matchesColor) {
				var location = results[0].geometry.location;
				var marker = new google.maps.Marker({
					map: map,
					//TODO: change the color based on parameters
					icon: iconColor,
					position: location,
	    			animation: google.maps.Animation.DROP
				});
				addPopupProfile(vendor)
				boundsList.push(location);
				//set the bounds if we're at the end of the vendor list
				console.log("length of boundsList: "+boundsList.length);
				console.log("length of vendorsList: "+vendorsLength);
				/*problem: that's the length of the full vendors list, not the number of vendors
				that fit the criteria. fix.*/
				//if (boundsList.length==vendorsLength) {
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
			+"		</div>"
			+"	</td>"
			+"	<td>"
			+"		<table border='1'>"
			+"			<tr>"
			+"				<td>Product Capability</td>"
			+"				<td id='prodCap'>"+product+"</td>"
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
		}
		else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
}


function addPopupProfile(vendor) {
	/*
	Popup client profile windows when you click on their map markers.
	*/
	var vendorName = vendor.name;
    var address1 = vendor.addressLine1;
    var address2 = getAddressLine2(vendor);
    var phone = vendor.primaryPhone;
    var email = vendor.primaryEmail;
    var website = "fake.com";
	var contentString = "<div id='popupContent'>"
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
	+"				<td id='prodCap'>"+product+"</td>"
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
var vendorsLength = 0;
function renderVendors(vendors, originCoord){
	vendorsLength = vendors.length;
	console.log("vendor length is: " + vendorsLength);
	var boundsList = [];

	for (var i = 0; i < vendorsLength; i++){
		vendor = vendors[i];
		renderFilteredVendor(originCoord, vendor, boundsList);
	}
}

/*
Calculates the distance (in miles) between 2 longitude/latitude points

coord1/coord2 - an array of size 2 where index 0 contains the latitude
and index 2 contains the longitude

returns the distance in miles between the two coordinates
*/
function calcDistance(coord1, coord2){
	var radius = 6471;
	var lat = deg2rad(coord1[0] - coord2[0]);
	var lon = deg2rad(coord1[1] - coord1[1]);
  	var a = Math.sin(lat/2) * Math.sin(lat/2) + 
  		Math.cos(deg2rad(coord2[0])) * Math.cos(deg2rad(coord1[0])) * 
  		Math.sin(lon/2) * Math.sin(lon/2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = radius * c; // Distance in km
	return d/1.609344; // returns distance in miles
}

/*
Converts from degrees to radians
*/
function deg2rad(deg) {
  return deg * (Math.PI/180);
}

/*
Renders vendor if:
1. vendor is within distance radius
2. TODO: vendor matches flower types
3. TODO: vendor matches lead time

clientAdress - the client's address as a string
vendor - JSON object representing vendor
*/
function renderFilteredVendor(originCoord, vendor, boundsList) {	
    if (filter(calcDistance(originCoord, vendor.lat_long))){
		addResultToList(vendor);
		addMarker(map, vendor, boundsList);
    }
	/*var vendorAddress = getAddress(vendor);
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
    });*/
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




