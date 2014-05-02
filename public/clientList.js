
// id of the form containing a list of the vendors
var vendorsID = "vendorList";

$(document).ready(function(){
	renderVendorList(partner_data);
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
