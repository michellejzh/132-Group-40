//initiate the map
function initializeMap() {
	var mapOptions = {
		center: new google.maps.LatLng(40.7078, -74.0119),
		zoom: 15
	};
	var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
	console.log("there should be a new map now");
}

google.maps.event.addDomListener(window, 'load', initializeMap);

function test() {
	alert("it works!");
}