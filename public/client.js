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
	$('#matches input:checked').each(function() {
	    selected.push($(this).attr('value'));
	});
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
		    var lat = res.results[0].geometry.location.lat;
		    var lng = res.results[0].geometry.location.lng;
			renderVendors(partner_data, [lat, lng]);
		}
	});
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
    $li.append($details1);
    $li.append($details2);
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
	console.log(vendor.id);
	var color = vendor.color;
	var currAddress = getAddress(vendor);
	if (color === "green"){
		var iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png';
	} else if (color === "blue"){
		var iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png';
	} else if (color === "red"){
		var iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png';
	}
	geocoder.geocode( { 'address': currAddress}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {	  
			var location = results[0].geometry.location;
			var marker = new google.maps.Marker({
				map: map,
				icon: iconColor,
				position: location,
	   			animation: google.maps.Animation.DROP
			});
			var contentString = getContentString(vendor);
			var infowindow = new google.maps.InfoWindow({
				content: contentString,
				width: 340
			});
			boundsList.push(location);
			//set the bounds if we're at the end of the vendor list
			//console.log("length of boundsList: "+boundsList.length);
			//console.log("length of vendorsList: "+vendorsLength);
			//add event listener so infowindow pops up on click
			fitBounds(boundsList);
			google.maps.event.addListener(marker, 'click', function() {
				infowindow.open(map,marker);
				//call the function that fills the info into the profile
				loadProfile();
			});
		}
		else {
			alert("Tried to add marker, but geocode was not successful for the following reason: " + status);
		}
	});
}

		    /*var product = vendor.productCapabilityIds;
		    var payment = vendor.paymentTerms.terms;
		    var lead = vendor.leadTime.leadTime;
			//gets the selected search parameters
			var productParam = getProductCapability();
			var leadParam = getLead();
			var paymentParam = getPayment();
			var matchesParam = getMatches();
			//now check to see whether the vendor matches the parameters

			var matchesProduct = false;
			var paramsMatched = 0;
			for (i=0;i<productParam.length;i++) {
				for (j=0;j<product;j++) {
					if (productParam[i]==product[j]) {
						paramsMatched++;
					}
				}
			}
			if (paramsMatched==productParam.length) {
				var matchesProduct = true;
			}

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
				if (color==matchesParam[i]) {
					var matchesColor = true;
				}
			}
			console.log("matchesColor is "+matchesColor);
			if (matchesColor) {
				var location = results[0].geometry.location;
				console.log("marker location is "+location);
				var marker = new google.maps.Marker({
					map: map,
					icon: iconColor,
					position: location,
	    			animation: google.maps.Animation.DROP
				});
				var contentString = getContentString(vendor);
				var infowindow = new google.maps.InfoWindow({
					content: contentString,
					width: 340
				});
				boundsList.push(location);

				if (boundsList.length==numVendors) {
					fitBounds(boundsList);
				}
				//add event listener so infowindow pops up on click
				google.maps.event.addListener(marker, 'click', function() {
					infowindow.open(map,marker);
					//call the function that fills the info into the profile
					loadProfile();
				});
				console.log("finished adding a marker");
				
			}
		}
		else {
			alert("Tried to add marker, but geocode was not successful for the following reason: " + status);
		}
	});
}*/

/*
Popup client profile windows when you click on their map markers.
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
    var website = "fake.com";
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
	+"			<div id='website'>Website: "+website+"</div>"
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

function translateCapability(ids) {
    ids = ids.replace("1", "Plants");
    ids = ids.replace("2", "Flowers");
    ids = ids.replace("3", "Orchids");
    ids = ids.replace(",", "<br>")
    return ids;
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
function renderVendors(vendors, originCoord){
	var boundsList = [];
	var filteredVendors = [];
	for (var i = 0; i < vendors.length; i++){
		vendor = vendors[i];
		renderFilteredVendor(originCoord, vendor, boundsList, filteredVendors);
	}
	addClosestVendors(filteredVendors, boundsList);
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

/*
Converts from degrees to radians
*/
function deg2rad(deg) {
  return deg * (Math.PI/180);
}

function contains(list, item){
	for (var i = 0; i < list.length; i++){
		if (list[i] == item) return true;
	}
	return false;
}

/*
Renders vendor if vendor is within distance radius.

clientAdress - the client's address as a string
vendor - JSON object representing vendor
*/

function renderFilteredVendor(originCoord, vendor, boundsList, filteredVendors) {	
	var distance = calcDistance(originCoord, vendor.lat_long);
    if (filter(distance)){
    	var vendorProduct = vendor.productCapabilityIds;
	    var vendorPayment = vendor.paymentTerms.id;
	    var vendorLead = vendor.leadTime.id;

		//gets the selected search parameters
		var productParam = getProductCapability();
		var leadParam = getLead();
		var paymentParam = getPayment();
		var matchesParam = getMatches();

		//now check to see whether the vendor matches the parameters
		// set matches product to true if the length is 0 (since many vendors leave it blank)
		var matchesProduct = true;
		for (var i=0; i < productParam.length; i++) {
			if (!contains(vendorProduct, parseInt(productParam[i]))){
				matchesProduct = false;
				break;
			}
		}

		var matchesLead = ((vendorLead == leadParam) || (vendorLead == 1) || (leadParam == 1));
		console.log("matchesLead: " + matchesLead);
		var matchesPayment = ((vendorPayment==paymentParam) || (vendorPayment == 1) || (leadParam == 1));
		console.log("matchesPayment: " + matchesPayment);
		if (matchesProduct && matchesLead && matchesPayment) {
			//green
			var iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png';
			var color = 'green';
		} else if (matchesProduct) {
			//blue
			var iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png';
			var color = 'blue';
		} else {
			//just matches distance - red
			var iconColor='http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png';
			var color = 'red';
		}

		var matchesColor = false;

		if ((color === 'green' && contains(matchesParam, "green")) ||
			color === 'blue' && contains(matchesParam, 'blue') ||
			color == 'red' && contains(matchesParam, 'red')){
			matchesColor = true;
		}

		if (matchesColor) {
			vendor.color = color;
			vendor.distance = distance;
			filteredVendors.push(vendor);
		}
    }
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

function addClosestVendors(filteredVendors, boundsList) {
	filteredVendors.sort(compareByDist);

	//it only allows you to drop 11 markers at a time before it gets angry
	var vendorsLength = (filteredVendors.length < 11) ? filteredVendors.length : 11;

    for (var i = 0; i < vendorsLength; i++) {
    	var vendor = filteredVendors[i];
    	addResultToList(vendor);
    	addMarker(map, vendor, boundsList);
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
Moves the map to the center of the address clicked
*/
function moveMapCenter() {
	geocoder.geocode( { 'address': document.vendorAddress}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map.setCenter(results[0].geometry.location);
			map.setZoom(8);
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




