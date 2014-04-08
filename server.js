var express = require('express');
var app = express();
app.use(express.json());
app.use(express.urlencoded());

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

//TO DO
app.get('/search.json', function(request, response){
    /*
    var messages = [];
    var q = conn.query('SELECT * FROM messages WHERE roomID=$1', [request.params.roomID]);
    //should I be putting things in a list here?
    //problem: it stops working because it doesn't like rows
    q.on('row', function(row){
        var nickname = row.nickname;
        var message = row.message;
        messages.push({nickname: nickname, message: message});
    });
    q.on('end', function(){
        response.json(messages);
    });
*/
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
app.post('/search.json', function(request, response){
    var address1 = request.param('addressLine1');
    var address2 = request.param('addressLine2');
    var city = request.param('city');
    var zip = request.param('zip');
    var state = request.param('state');
    var distance = request.param('distance'); 

    var referenceAddress = vendor(address1, address2, city, state, zip, "");

    var vendorList = [referenceAddress];

    var q = conn.query("SELECT * FROM vendors");

    q.on('row', function(row){
        vendorList.push(address(row.address1,
                        row.address2,
                        row.city,
                        row.zip,
                        row.state,
                        row.name});
    });

    q.on('end', function(){
        response.json(list);
    });

    //do we need search IDs?
    /*
    var roomID = request.params.roomID;
    var nickname = request.body.nickname;
    var message = request.body.message;   // 'Baby baby baby ohhhhh'
    var roomName = request.body.roomName; // 'Justin'
    var time = request.body.time;
    var q = conn.query('INSERT INTO messages VALUES ($1, $2, $3, $4, $5)', [roomID, roomName, nickname, message, time]);
    // post everything to the database, then...
    q.on('end', function(){
        response.redirect('/room/' + roomID + "/" + roomName);
    });*/
});

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
