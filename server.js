var express = require('express');
var app = express();
app.use(express.json());
app.use(express.urlencoded());

//chatroom DB
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://Database/vendors.db');

//==============SEARCH PAGE==============//
app.get('/othertest', function(request, response){
    console.log('- Request received:', request.method, request.url);
    //response.render('search-results.html');
    conn.query('SELECT * FROM vendors')
    .on('row', function(row) {
    	response.write(row.name+", "+row.address);
    	response.end();
    });
});


app.listen(8080, function(){
    console.log(' - Server listening on port 8080');
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



//============VENDOR LIST PAGE============//


//============VENDOR EDIT PAGE============//
