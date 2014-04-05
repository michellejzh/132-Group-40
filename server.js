var express = require('express');
var app = express();
app.use(express.json());
app.use(express.urlencoded());

//chatroom DB
var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://vendors.db');

//==============SEARCH PAGE==============//
app.get('*', function(request, response){
    response.render('search-results.html');
    var q = conn.query('SELECT * FROM vendors');
    q.on('row', function(row) {
    	response.send(row.name+", "+row.address);
    });
});

//==============RESULTS PAGE==============//



//============VENDOR LIST PAGE============//


//============VENDOR EDIT PAGE============//