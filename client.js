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
	console.log('about to find JSON');
	//get the results to return
	//THIS MEANS: REPLACE SEARCH.JSON WITH EACH SEARCH
	/*var request = new XMLHttpRequest();
    request.open('GET', '/search.json', true);
    request.addEventListener('load', function(e){
    	console.log(request.status);
        if (request.status == 200) {
            var content = request.responseText;
            var data = JSON.parse(content);
            console.log(data);
        }
    }, false);*/
	
    //add them to the DOM
	var ul = document.getElementById("results-list");
	var li = document.createElement('li');
	var id = Math.random(150000); //id of the client
	li.setAttribute('id', id);
	li.innerHTML = '<a href="../resultsPage.html"><div id="icon">icon goes here</div><div id="details"><div id="name">Vendor Name<br></div><div id="address">123 Address St., Providence RI 02912<br></div><div id="desc">some details about the vendor some details about the vendor some details about the vendor<br></div></div></a>';
	ul.appendChild(li);

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

//convert address to coordinates
	//or other search function?
function convertToCoord(address) {
	//		#TO DO
}

function centerMarker() {
	//navigate so that the selected client (from sidebar)
	//is centered on the map

}