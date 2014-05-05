// id for the form
var formID = 'queryVendorForm';

var distanceName = 'distance';

var address1Name = "addressLine1";

var address2Name = "addressLine2";

var cityName = "city";

var stateName = "state";

var zipcodeName = "zipcode";

var errorClass = 'error';

var errorMsgClass = 'errorMsg';

$(document).ready(function(){
	initiateFormValidation();
});

function getInput(name){
    var $form = $("#" + formID);
    return $form.find('input[name=\"' + name + '\"]');
}

function showError(name){
	$("#" + name).css('display', 'block');
	getInput(name).addClass(errorClass);
}

/*
Validates the user input 
*/
function initiateFormValidation() {
    var $form = $("#" + formID);
    $form.submit(function(e) {
    	// remove all error stylings
		$("." + errorClass).removeClass(errorClass);
		$("." + errorMsgClass).css('display', 'none');

		// get user input
    	var distanceInput = getInput(distanceName).val();
    	var address1Input = getInput(address1Name).val();

    	// show errors if there are any
        if ((distanceInput.length === 0) || isNaN(distanceInput) || (parseInt(distanceInput) <= 0)){
        	e.preventDefault();
        	showError(distanceName);
        }
        if (address1Input.length == 0){
        	e.preventDefault();	
        	showError(address1Name);
        }
    });
}