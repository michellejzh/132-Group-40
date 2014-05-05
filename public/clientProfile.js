

// link to the server
var serverURL = "http://localhost:8080/partner_data.json";
console.log("called loadProfile");
//$("#profile-div").load("clientProfile.html");
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
function getIDFromURL(){
    //var address = getParam('addressLine1') + " " + getParam('addressLine2') + ", " + getParam('city') + ", " + getParam('state') + " " + getParam("zipcode");
    //return address.replace(new RegExp("\\+", 'g'), " ")
    document.vendorID = getParam('id');
    console.log("vendor ID is: "+document.vendorID);
}



function loadProfile(){
    getIDFromURL();
	console.log("called loadProfile");

    for (var k = 0; k < partner_data.length; k++){
        //console.log(partner_data[k]);
        if(partner_data[k].id == document.vendorID){
            renderProfile(partner_data[k]);
        }
    }
}

function renderProfile(vendor) {
	var vendorName = vendor.name;
    var address1 = vendor.addressLine1;
    var address2 = getAddressLine2(vendor);
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
}

function translateCapability(ids) {
    ids = ids.replace("1", "Plants");
    ids = ids.replace("2", "Flowers");
    ids = ids.replace("3", "Orchids");
    ids = ids.replace(",", "<br>")
    return ids;
}

/*
Given a JSON object of a vendor, returns the vendor's address as a string
*/
function getAddressLine2(vendor){
    return vendor.addressLine2 + " " + vendor.city + ", " + vendor.state + " " + vendor.zip;
}
