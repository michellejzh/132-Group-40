var express = require('express');
var app = express();
app.use(express.json());
app.use(express.urlencoded());

//chatroom DB
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://vendors.db');

//==============SEARCH PAGE==============//
app.get('/', function(request, response){
    console.log('- Request received:', request.method, request.url);
    //response.render('search-results.html');
    conn.query('SELECT name FROM vendors')
    .on('row', function(row) {
    	response.write(row.vendorName);
    	response.end();
    });
});


app.listen(8080, function(){
    console.log(' - Server listening on port 8080');
});

//==============RESULTS PAGE==============//



//============VENDOR LIST PAGE============//


//============VENDOR EDIT PAGE============//
