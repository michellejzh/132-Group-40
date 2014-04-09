//
var express = require('express');
var app = express();
app.use(express.json());
app.use(express.urlencoded());

//connect to vendor database
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://Database/vendors.db');

//using HTML templates
var engines = require('consolidate');
app.engine('html', engines.hogan); 
app.set('views', './' + '/templates');

//finding static local files
app.use('/public', express.static(__dirname + '/public'));

app.listen(8080, function(){
    console.log(' - Server listening on port 8080');
});

//================JSON GET AND POST===============//

app.get('/search.json', function(request, response){
    response.setHeader("Access-Control-Allow-Origin", "*");
    var vendorList = [];
    var q = conn.query('SELECT * FROM vendors');
    console.log("selecting vendors");
    q.on('row', function(row){
        console.log("are we here");
        vendorList.push(
            {addressLine1: row.address, 
            city: row.city, 
            zipcode: row.zipcode, 
            state: row.state, 
            phone: row.phone, 
            name: row.vendorName});
    });

    q.on('end', function(){
        response.json(vendorList)
    });
});

/*
constructs a vendor object
*/
function vendor(address1, address2, city, state, zip, name){
    return {address1: address1, address2: address2, city: city, state: state, zip: zip, name: name};
}

/*
Executes when the user runs a query.

Reponds with a JSON object where the first object is the address the user
the querying and the following addresses are addresses in the database
*/
/*app.get('/search.json', function(request, response){
    
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");
    response.setHeader("Access-Control-Allow-Origin", "*");
    var vendorList = [];

    var q = conn.query("SELECT * FROM vendors");

    q.on('row', function(row){
        vendorList.push(address(row.address,
                        row.city,
                        row.zipcode,
                        row.state),
                        row.vendorName,
                        row.phone)
    });

    q.on('end', function(){
        response.json(vendorList)
    });

});*/

//================JSON TEST===============//

app.get('/test.json', function(request, response){
    var list = [];
    console.log("ahhhhh");
    var q = conn.query('SELECT * FROM vendors');
    console.log("selecting vendor names");
    console.log(q);
    q.on('row', function(row){
    	console.log("is it here");
    	console.log(row);
        var vendorName = row.vendorName;
        list.push({row: row});
    });
    q.on('end', function(){
        response.json(list);
    });
});

//==============RESULTS PAGE==============//
app.get('/search-results', function(request, response){
    response.render('searchResults.html');
});

//============VENDOR LIST PAGE============//


//============VENDOR EDIT PAGE============//


//==============SEARCH PAGE==============//
app.get('*', function(request, response){
    response.render('search.html');
});
