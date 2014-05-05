// id for the form
var formID = 'queryVendorForm';

// name of the input that stores distance
var distanceName = 'distance';

// name of the input that stores the address
var address1Name = "addressLine1";

// name of the class of inputs that contains an error
var errorClass = 'error';

// name of the class that displays error messages
var errorMsgClass = 'errorMsg';

$(document).ready(function(){
	initiateFormValidation();
});

/*
Gets the input with the associated name

name - a string of the name of the input you are querying
*/
function getInput(name){
    var $form = $("#" + formID);
    return $form.find('input[name=\"' + name + '\"]');
}

/*
Displays an error by:

1. outlining the offending input in red
2. display an error message beneath the input
*/
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