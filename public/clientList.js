// the location of the server that provides vendor information
var serverURL = "http://localhost:8080/search.json";

// id of the form containing a list of the vendors
var vendorsID = "vendorList";

$(document).ready(function(){
	var vendorJSON = getVendors();
	console.log(vendorJSON);
	renderVendors(vendorJSON);
});

/*
Adds the vendors to the list in the HTML page
*/
function renderVendors(vendorJSON){
	var length = vendorJSON.length;
	var $vendorList = $('#' + vendorsID);

	for (var i = 0; i < length; i++){
		var vendor = vendorJSON[i];
		/*var $tweetBodyP = $('<span>', {
			class: 'tweet_body',
			text: $tweet.text
		});
		$vendorList.append($li);*/
	}
}

/*
Gets a list of vendors from the server.

Returns a JSON object of all the vendors
*/
function getVendors(vendorJSON){
	var request = new XMLHttpRequest();

	// eventlistener that gets the vendors when loaded
    request.addEventListener('load', function(e){
        if (request.status == 200) {
            var content = request.responseText;
            var data = JSON.parse(content);
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