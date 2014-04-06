/*
Functions in this file:
	initializeMap - creates the map on page load
	placeMarker - places a marker on the map corresponding to a vendor
	centerMarker - center a certain marker, called when you click on a vendor's info

	Some to do:
		should we have a seperate file for map JS and field/search JS?

		everything related to search
			pass search results to the DOM for display
*/

//initiate the map
function initializeMap() {
	var mapOptions = {
		center: new google.maps.LatLng(40.7078, -74.0119),
		zoom: 16
	};
	var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
	console.log("there should be a new map now");
}

google.maps.event.addDomListener(window, 'load', initializeMap);

function returnResults() {
	//add clients to the list of id="results-list"
	//load info from a json table that has received results from the DB
	//add id to each li?
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
}

//convert address to coordinates
	//or other search function?
function convertToCoord(address) {
	//		#TO DO
}

function centerMarker() {
	//navigate so that the selected client (from sidebar)
	//is centered on the map

}