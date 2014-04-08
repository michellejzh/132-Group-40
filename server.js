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

app.get('/search.json', function(request, response){
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
});









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
app.get('/search-results', function(request, response){
    response.render('searchResults.html');
});

//============VENDOR LIST PAGE============//


//============VENDOR EDIT PAGE============//


//==============SEARCH PAGE==============//
app.get('*', function(request, response){
    response.render('search.html');
});
