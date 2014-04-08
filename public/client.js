//initiate the map
function initializeMap() {
	var mapOptions = {
		center: new google.maps.LatLng(40.7078, -74.0119),
		zoom: 16
	};
	map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
	geocoder = new google.maps.Geocoder();
}

google.maps.event.addDomListener(window, 'load', initializeMap);

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
	console.log('about to find JSON');
	//get the results to return
	//THIS MEANS: REPLACE SEARCH.JSON WITH EACH SEARCH
	var request = new XMLHttpRequest();
    request.open('GET', '/search.json', true);
    request.addEventListener('load', function(e){
    	console.log(request.status);
        if (request.status == 200) {
            var content = request.responseText;
            var data = JSON.parse(content);
            console.log(data);
        }
    }, false);
	
    //char to add: name, address, short desc, 
    var currAddress = "256 Thayer St Providence RI 02906";

    //add them to the DOM
	var ul = document.getElementById("results-list");
	var li = document.createElement('li');
	var id = Math.random(150000); //id of the client
	li.setAttribute('id', id);
	li.setAttribute('onclick', "document.vendorAddress='Skúlagata 28, 101 Reykjavík, Iceland'; moveMapCenter();");
	li.innerHTML = '<div id="icon">icon goes here</div><div id="details"><div id="name">Vendor Name<br></div><div id="address">Skúlagata 28, 101 Reykjavík, Iceland<br></div><div id="desc">some details about the vendor some details about the vendor some details about the vendor<br></div></div>';
	ul.appendChild(li);

	//add a marker
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

//input: results of a search
//output: places markers on the map corresponding to the coordinates of each result
/*
function placeMarker(searchResults) {
	for (int i=0; i=len(searchResults); i++) {
		var point = convertToCoord(searchResults[i].address);
		_map.setCenter(point);
		var marker = new google.maps.Marker({
			'map' : _map,
			'position' : point
		});
	}
}
*/

function selectVendor(vendor) {
	alert("selecting a vendor!");
	//need to make fields for vendors
	//var vendorID = vendor.ID
	//window.location.assign("./vendor/"+vendorID);
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