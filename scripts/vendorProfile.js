//clientProfile.js helps build each unique profile for clientProfile.html


/* getParam
Gets the parameter of the URL as a string

name - the string representing the name of the parameter you want to retrieve
*/
function getParam(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}

/* loadProfile
searches the partner data array for the profile of the id entered in the URL
*/
function loadProfile(){
    document.vendorID = getParam('id');
    for (var k = 0; k < partner_data.length; k++){
        if(partner_data[k].id == document.vendorID){
            renderProfile(partner_data[k]);
        }
    }
}


/*renderProfile
creates necessary DOM elements for the given vendor
*/
function renderProfile(vendor) {
	var vendorName = vendor.name;
    var address1 = vendor.addressLine1;
    var address2 = vendor.addressLine2 + " " + vendor.city + ", " + vendor.state + " " + vendor.zip;
    var primaryContact = vendor.primaryContact;
    var phone = vendor.primaryPhone;
    var email = vendor.primaryEmail;
	var capability = String(vendor.productCapabilityIds);
    if (capability=="") {
        capability = "None Specified";
    }
    capability = translateCapability(capability);
    var payment = vendor.paymentTerms.terms;
    var lead = vendor.leadTime.leadTime;

    //non-table
    $("#name").append(vendorName);
    $("#address").append(address1+"<br>"+address2);
    $("#primaryContact").append(primaryContact);
    $("#phone").append(phone);
    $("#email").append("<a href='mailto:"+email+"'>"+email+'</a>');
	//table
    $("#prodCap").append(capability);
    $("#payment").append(payment);
    $("#leadTime").append(lead);
    initializeMap(address1+address2);
}


/*translateCapability
replaces productCapabilityID with corresponding flora
*/
function translateCapability(ids) {
    ids = ids.replace("1", "Plants");
    ids = ids.replace("2", "Flowers");
    ids = ids.replace("3", "Orchids");
    ids = ids.replace(",", "<br>")
    return ids;
}


var geocoder = new google.maps.Geocoder();
var mapID = "map-canvas";


/*initializeMap
generates a Google Map cenetered at this vendor's address
*/
function initializeMap(address) {
    console.log(String(address));
    geocoder.geocode( { 'address': String(address)}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {    
            var location = results[0].geometry.location;
            console.log(location);
            var mapOptions = {
                center: location,
                zoom: 7
            };
            map = new google.maps.Map($('#' + mapID)[0], mapOptions);
            console.log(map);
            var marker = new google.maps.Marker({
                map: map,
                icon: 'http://maps.google.com/mapfiles/marker_green.png',
                position: location,
                animation: google.maps.Animation.DROP
            });
        }
        else {
            alert("Tried to add marker, but geocode was not successful for the following reason: " + status);
        }
    });
}
