/* ==============================
Javascript for searchResults.html
================================= */


//ID for the map canvas
var mapID = "map-canvas";
//div ID for resulsts list ID
var resultsListID = "results-list";
//Geocoder
var geocoder = new google.maps.Geocoder();
//Minimum distance for vendors
var distance = 0;
//Lists for the markers and clients to add to the results list
var markersArray = [];
var resultList = [];

var vendorsAdded = 0;
var geoCounter = 0;

//Keeps track of vendors within distance limit
var filteredVendors = [];

//Keeps track of vendors on the map for bounds
var boundsList = [];

//Get the distance specified from the search
$(document).ready(function(){
	distance = parseInt(getParam('distance'));
	document.getElementById("searchAddress").innerHTML = "You searched for:  " + getAddressFromURL() + "  within " + getParam('distance') + " miles.";
})

/*
Gets the parameter of the URL as a string.

IN: name - the string representing the name of the parameter you want to retrieve
*/
function getParam(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}

/*
Returns a string of the address by parsing the URL parameters.
*/
function getAddressFromURL(){
	var address = getParam('addressLine1') + " " + getParam('addressLine2') + " " + getParam('city') + " " + getParam('state') + " " + getParam("zipcode");
	return address.replace(new RegExp("\\+", 'g'), " ")
}


/*
Initializes the map.
*/
function initializeMap() {
	//paints map
	var mapOptions = {
		center: new google.maps.LatLng(40.7078, -74.0119),
		zoom: 7
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
			//Display the specified distance from client.
			var lat = res.results[0].geometry.location.lat;
		    var lng = res.results[0].geometry.location.lng;
			renderVendors(partner_data, [lat, lng], address);
		}
	});
}


/*
Takes the list of vendors and passes them to renderFilteredVendor to be filtered
by distance.

IN: vendors - the complete JSON list of vendors
	clientCoord - the coordinates of the client's address
*/
function renderVendors(vendors, clientCoord, address){
	addClientMarker(address, boundsList);
	for (var i = 0; i < vendors.length; i++){
		vendor = vendors[i];
		renderFilteredVendor(clientCoord, vendor, boundsList, filteredVendors);
	}
	filteredVendors.sort(compareByDist);
	addClosestVendors(filteredVendors, boundsList);
}


/*
Renders vendor if vendor is within distance radius.

clientAdress - the client's address as a string
vendor - JSON object representing vendor
*/
function renderFilteredVendor(originCoord, vendor, boundsList, filteredVendors) {	
	var distance = calcDistance(originCoord, vendor.lat_long);
    if (filter(distance)){
		vendor.color = "green";
		vendor.distance = distance;
		filteredVendors.push(vendor);
	}
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
Functions to get the specifications from "Filter Results"
*/

//Product capability
function getProductCapability() {
	var selected = [];
	$('#product input:checked').each(function() {
	    selected.push($(this).attr('value'));
	});
	return selected;
}
//Lead time
function getLead() {
	return $('#delivery input:checked').attr('value');
}
//Payment terms
function getPayment() {
	return $('#payment input:checked').attr('value');
}
//The color markers you want to display
function getMatches() {
	var selected = [];
	$('#matches input:checked').each(function() {
	    selected.push($(this).attr('value'));
	});
	return selected;
}


/* addClosestVendors
adds the ten closest vendors to the map by absolute distance
*/
function addClosestVendors(filteredVendors, boundsList) {
	//Bound at 10 vendors so that the maximum query limit isn't reached
	var vendorsLength = (filteredVendors.length < 10) ? filteredVendors.length : 10;

    for (; vendorsAdded < vendorsLength; vendorsAdded++) {
    	var vendor = filteredVendors[vendorsAdded];
		addMarker(map, vendor, boundsList);
    }
	document.getElementById("load").onclick = function(){waitMessage();};
	document.getElementById("load").style.backgroundColor="red";
	setTimeout(function(){
		document.getElementById("load").onclick = function(){addTenVendors();};
		document.getElementById("load").style.backgroundColor="green";
	}, 11000);
}


/* addTenVendors
adds up to ten more vendors to the map depending on how many vendors are left in filteredVendors
*/

function addTenVendors(){
	var vendorsLength = filteredVendors.length-vendorsAdded;
	var temp = vendorsAdded + 10
	if (vendorsLength > 10){
		vendorsLength = 10;
	}
	if (vendorsLength == 0){ //All possible vendors are already being displayed
		alert("All vendors within " + getParam('distance') + " miles are being shown");
	}
	for (; vendorsAdded < temp; vendorsAdded++){
		var vendor = filteredVendors[vendorsAdded];
		addMarker(map, vendor, boundsList);
	}
	document.getElementById("load").onclick = function(){waitMessage();};
	document.getElementById("load").style.backgroundColor="red";
	setTimeout(function(){
		document.getElementById("load").style.backgroundColor="green";
		document.getElementById("load").onclick = function(){addTenVendors();};
	}, 11000);
}

/*
Displays a message that tells the user to wait until maps can query more markers.
*/
function waitMessage() {
	console.log("called waitMessage");
	document.getElementById("wait").style.display="inline-block";
	setTimeout(function(){
		$("#wait").fadeOut(1000);
	}, 3000);
}
/*
Adds a marker at the client's location, and a circle around it denoting the
area on the map within the specified distance requirement.

IN: address - a string representing an address
	boundsList - the list of coordinates that define the bounds of the map
*/
function addClientMarker(address, boundsList) {
	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {	  
		var location = results[0].geometry.location;
		var marker = new google.maps.Marker({
			map: map,
			icon: '../public/flower_marker.png',
			position: location,
			animation: google.maps.Animation.DROP
		});
		//set the properties of the distance circle
		var distanceOptions = {
		  strokeColor: '#FF0000',
		  strokeOpacity: 0.3,
		  strokeWeight: 2,
		  fillColor: '#FF0000',
		  fillOpacity: 0.05,
		  map: map,
		  center: location,
		  radius: distance*1609.34
		};
		//add the distance circle
		var distanceCircle = new google.maps.Circle(distanceOptions);
		boundsList.push(location);
		fitBounds(boundsList);
		}
		else {
			alert("Tried to add marker, but geocode was not successful for the following reason: " + status);
		}
	});
}


/*
Adds a marker of a color determined by which specifications it matches.
	Red: matches the distance, but not the product.
	Yellow: matches the distance and product, but not both the lead time and payment terms.
	Green: matches distance, product, lead time, and payment terms.

IN: map - the map object
	vendor - the list object in partner_data.json of the current vendor
	boundsList - the list of coordinates that define the bounds of the map
*/
function addMarker(map, vendor, boundsList) {
	//get the color parameter, which was set in renderFilteredVendor
	var color = vendor.color;
	var currAddress = getAddress(vendor);
	if (color == "green"){
		var iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png';
	} else if (color == "yellow"){
		var iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/yellow-dot.png';
	} else if (color == "red"){
		var iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png';
	}
	geocoder.geocode( { 'address': currAddress}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			//add info to the results list and marker to the map
			addResultToList(vendor);
			resultList.push(vendor);
			var location = results[0].geometry.location;
			var marker = new google.maps.Marker({
				map: map,
				icon: iconColor,
				position: location,
	   			animation: google.maps.Animation.DROP
			});
			markersArray.push(marker);

			//set the content of the info window
			var contentString = getContentString(vendor);
			var infowindow = new google.maps.InfoWindow({
				content: contentString,
				width: 340
			});
			boundsList.push(location);
			fitBounds(boundsList);
			//add event listener so infowindow pops up on click
			google.maps.event.addListener(marker, 'click', function() {
				infowindow.open(map,marker);
				//call the function that fills the info into the profile
				loadProfile();
			});
		}
		else {
			alert("Tried to add marker, but geocode was not successful for the following reason: " + status);
		}
		geoCounter++; //Counts how many times the geocode has been called, want to filter colors every 10 times
		if (geoCounter%10==0){
			filterColors();
		}
	});
}

/*
Moves the map to the center of the address clicked
*/
function moveMapCenter() {
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

/*
Set the content of the info window that pops up with the client's profile info
when you click on its marker on the map.

IN: vendor - the list object in partner_data.json of the current vendor
*/
function getContentString(vendor) {
    var capability = String(vendor.productCapabilityIds);
    if (capability=="") {
        capability = "None Specified";
    }
    capability = translateCapability(capability);
    var payment = vendor.paymentTerms.terms;
    var lead = vendor.leadTime.leadTime;
	var vendorName = vendor.name;
    var address1 = vendor.addressLine1;
    var address2 = getAddressLine2(vendor);
    var phone = vendor.primaryPhone;
    var email = vendor.primaryEmail;
	var contentString = "<div id='popupContent'>"
	+"<table id='profile'>"
	+"<tr>"
	+"	<td>"
	+"		<div id='info1'>"
	+"			<div id='name'>"+vendorName+"</div>"
	+"			<button onclick='goToProfile("+vendor.id+")'>Full profile</button>"
	+"			<div id='address'>"+address1+"<br>"+address2+"</div>"
	+"			<div id='phone'>Phone: "+phone+"</div>"
	+"			<div id='email'>Email: "+email+"</div>"
	+"		</div>"
	+"	</td>"
	+"	<td>"
	+"		<table border='1' id='info2'>"
	+"			<tr>"
	+"				<td>Product Capability</td>"
	+"				<td id='prodCapInfo'>"+capability+"</td>"
	+"			</tr>"
	+"			<tr>"
	+"				<td>Payment Method</td>"
	+"				<td id='paymentInfo'>"+payment+"</td>"
	+"			</tr>"
	+"			<tr>"
	+"				<td>Lead Time</td>"
	+"				<td id='leadTimeInfo'>"+lead+"</td>"
	+"			</tr>"
	+"		</table>"
	+"	</td>"
	+"</tr>"
	+"</div>"
	return contentString;
}


/*
Translate the productCapabilityIds into their associated strings.
Called from getContentString.

IN: ids - a string of the ids in the productCapabilityIds array from
	the vendor in partner_data.json
OUT: the translated IDs
*/
function translateCapability(ids) {
    ids = ids.replace("1", "Plants");
    ids = ids.replace("2", "Flowers");
    ids = ids.replace("3", "Orchids");
    ids = ids.replace(",", "<br>")
    return ids;
}


/*
Filters the markers on the map to display only the specified marker color.
*/
function filterColors() {
	var productParam = getProductCapability();
	var leadParam = getLead();
	var paymentParam = getPayment();
	var matchesParam = getMatches();

	for (var i = 0; i < resultList.length; i++) {
		var productBool = true;
		var leadBool = true;
		var paymentBool = true;

		for (var k = 0; k < productParam.length; k++) {
			if (!contains(resultList[i].productCapabilityIds, parseInt(productParam[k]))){
				productBool = false;
			}
		}
		if (resultList[i].leadTime.id != leadParam && leadParam!=1){
			leadBool = false;
		}
		if (resultList[i].paymentTerms.id != paymentParam && paymentParam!=1){
			paymentBool = false;
		}
		if (productBool && leadBool && paymentBool){
			markersArray[i].setIcon('http://www.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png');
			updateListColor(i, 'green');
			if (!contains(matchesParam, "green")){
				markersArray[i].setMap(null);
				setLiVisibility(i, false, "green");
			}
			else{
				markersArray[i].setMap(map);
				setLiVisibility(i, true, "green");
			}
		}
		else if (productBool){
			markersArray[i].setIcon('http://www.google.com/intl/en_us/mapfiles/ms/micons/yellow-dot.png');
			updateListColor(i, 'yellow');
			if (!contains(matchesParam, "yellow")){
				markersArray[i].setMap(null);
				setLiVisibility(i, false, "yellow");
			}
			else{
				markersArray[i].setMap(map);
				setLiVisibility(i, true, "yellow");
			}
		}
		else{
			markersArray[i].setIcon('http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png');	
			updateListColor(i, 'red');
			if (!contains(matchesParam, "red")){
				markersArray[i].setMap(null);
				setLiVisibility(i, false, "red");
			}
			else{
				markersArray[i].setMap(map);
				setLiVisibility(i, true, "red");
			}
		}
	}
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
    var color = vendor.color;

    //create DOM elements
    var $li = $("<li>", {
    	class: 'vendorLi',
    	value: id
    });

    var $vendorColor = $("<div>", {
    	class: "vendorColor",
    	value: color
    });
    $vendorColor.css("background", color);

    var $details1 = $("<div>", {
    	class: 'details1'
    });
    var $details2 = $("<div>", {
		class: 'details2'
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
    	text: "Center map"
    });
    var newURL = window.location.pathname+"../../clientProfile.html";
    $profile.attr('onclick', "window.location.assign('"+newURL+"?id="+id+"'); loadProfile()");
    $map.attr('onclick', "document.vendorAddress='"+address1+" "+address2+"'; moveMapCenter();");
    // add DOM elements to page
    $details1.append($name);
    $details1.append($address1);
    $details1.append($address2);
    $details1.append($phone);
    $details2.append($profile);
    $details2.append("<br>");
    $details2.append($map);
    $li.append($vendorColor);
    $li.append($details1);
    $li.append($details2);
    $("#" + resultsListID).append($li);
}


//TODO
function updateListColor(i, color) {
	var $list = $('.vendorLi');
	var vendor = $list;
	$(vendor[i].firstChild).css("background", color);
}

function setLiVisibility(i, visible, color) {
	var $list = $('.vendorLi');
	var vendor = $list;
	if (visible) {
		$(vendor[i]).css("display", "list-item");
		$(vendor[i].firstChild).css("background", color);
	}
	else {
		$(vendor[i]).css("display", "none");
	}
}

/*
Redirect to a given client's profile page.

IN: id - the ID of the given client
*/
function goToProfile(id) {
	var newURL = window.location.pathname+"../../clientProfile.html?id="+id;
	window.location.assign(newURL);
}

/*
Fit the map to bounds defined by a set of points.

IN: boundsList - the list of coordinates determining the bounds
	which has the coordinate of each marker pushed to it.
*/
function fitBounds(boundsList) {
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i < boundsList.length; i++) {
  		bounds.extend(boundsList[i]);
  	}
  	map.fitBounds(bounds);
  	//in case the zoom is too high when the bounds are small
  	if (map.getZoom()>8) {
  		map.setZoom(8);
  	}
}


/*
Calculates the distance (in miles) between 2 longitude/latitude points

coord1/coord2 - an array of size 2 where index 0 contains the latitude
and index 2 contains the longitude

returns the distance in miles between the two coordinates
*/
function calcDistance(coord1, coord2){
	var radlat1 = Math.PI * coord1[0]/180;
	var radlat2 = Math.PI * coord2[0]/180;
	var radlon1 = Math.PI * coord1[1]/180;
	var radlon2 = Math.PI * coord2[1]/180;
	var theta = coord1[1]-coord2[1];
	var radtheta = Math.PI * theta/180;
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist) * 180/Math.PI * 60 * 1.1515;
	return dist;
}

function contains(list, item){
	for (var i = 0; i < list.length; i++){
		if (list[i] == item) return true;
	}
	return false;
}

/*
A sorting function that compares two vendors by distance.

a, b - vendors
*/
function compareByDist(a, b){
	if (a.distance < b.distance) return -1;
	if (a.distance > b.distance) return 1;

	return 0;
}


