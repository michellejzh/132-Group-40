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
    console.log("'Select * From Vendors' being queried");
    q.on('row', function(row){
        console.log(row);
        vendorList.push(
            {primaryKey: row.primaryKey,
            addressLine1: row.address, 
            city: row.city, 
            zip: row.zipcode, 
            state: row.state, 
            phone: row.phone, 
            name: row.vendorName});
    });
    q.on('end', function(){
        response.json(vendorList)
    });
});

//might want this to just be every search
app.get('/profile/:id.json', function(request, response){
    response.setHeader("Access-Control-Allow-Origin", "*");
    var vendorList = [];
    var id = request.params.id;
    var q = conn.query('SELECT * FROM vendors WHERE primaryKey=$1', [id]);
    console.log("'Select * from vendors where id is "+id+" being queried");
    q.on('row', function(row){
        console.log(row);
        vendorList.push(
            {addressLine1: row.address, 
            city: row.city, 
            zip: row.zipcode, 
            state: row.state, 
            phone: row.phone, 
            name: row.vendorName,
            email: row.email,
            website: row.website,
            capID: row.productCapabilityId,
            payment: row.paymentTerms,
            lead: row.leadTime,
            rate: row.rate,
            deliveryFee: row.deliveryFee});
    });

    q.on('end', function(){
        response.json(vendorList)
    });
});

/*
app.get('/test.json', function(request, response){
    response.setHeader("Access-Control-Allow-Origin", "*");
    var list = [];
    console.log("Querying /test.json");
    var q = conn.query('SELECT * FROM vendors');
    q.on('row', function(row){
        var vendorName = row.vendorName;
        list.push({row: row});
    });
    q.on('end', function(){
        response.json(list);
    });
});
*/
