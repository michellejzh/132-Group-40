// the location of the server that provides vendor information
var serverURL = "http://localhost:8080/partner_data.json";

// id of the form containing a list of the vendors
var vendorsID = "vendorList";

$(document).ready(function(){
	renderVendors();
});


var newURL = window.location.pathname+"../../clientProfile.html";

/*
Adds the vendors to the list in the HTML page
*/
function renderVendorList(vendorJSON){
	var length = vendorJSON.length;
	var $vendorList = $('#' + vendorsID);

	for (var i = 0; i < length; i++){
		var vendor = vendorJSON[i];

		// create relevant DOM objects
		var $li = $('<li>', {
			class: 'vendorLi'
		});
		var $name = $('<div>', {
			class: 'vendorName',
			text: vendor.name
		});
		var $phone = $('<div>', {
			class: 'vendorPhone',
			text: vendor.primaryPhone
		});
		var $address = $('<div>', {
			class: 'vendorAddress',
			text: vendor.addressLine1 + " " + vendor.addressLine2 + ", " + vendor.city + ", " + vendor.state + " " + vendor.zip
		});

		// adds DOM objects to page
		$li.append($name);
		$li.append($phone);
		$li.append($address);
		$li.attr('onclick', "window.location.assign('"+newURL+"?id="+vendor.id+"'); loadProfile()");
		$vendorList.append($li);
	}
}

/*
Gets a list of vendors from the server and renders it on the page

Returns a JSON object of all the vendors
*/
function renderVendors(vendorJSON){
	var request = new XMLHttpRequest();

	// eventlistener that gets the vendors when loaded
    request.addEventListener('load', function(e){
        if (request.status == 200) {
            var content = request.responseText;
            var data = JSON.parse(content);
            renderVendorList(data);
        } else {
        	console.log("FUCK");
        }
    }, false);

    // eventlistener for errors
    request.addEventListener('error', function(e){
		console.log('error');
	}, false);

    // open and send request
	request.open('GET', serverURL, true);
	request.send();
}
