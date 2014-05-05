function getParam(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}


function getNameFromURL(){
	var nameFilter = getParam('name');
	return nameFilter.replace(new RegExp("\\+", 'g'), " ")
}

function getStateFromURL(){
	var stateFilter = getParam('state');
	return stateFilter.replace(new RegExp("\\+", 'g'), " ")
}

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
	var filterOnName = 0;
	var filterOnState = 0;
	try{
		var nameFilter = getNameFromURL();
		var filterOnName = 1;
	}
	catch (e){
		//No big deal
	}

	try{
		var stateFilter = getStateFromURL();
		var filterOnState = 1;
	}
	catch (e){
		//No big deal
	}
	for (var i = 0; i < length; i++){
		var vendor = vendorJSON[i];
		if (filterOnName===1){
			if (vendor.name.toLowerCase().indexOf(nameFilter.toLowerCase()) > -1){
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
		else if (filterOnState===1){
			if (vendor.state.toLowerCase().indexOf(stateFilter.toLowerCase()) > -1){
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
		else{
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
}

