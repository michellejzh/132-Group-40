var anyDB = require('any-db');
var vendorer = require('./vendorer.js');

var conn = anyDB.createConnection('sqlite3://vendors.db');

conn.query('CREATE TABLE vendors (primaryKey INTEGER, name TEXT, address TEXT, city TEXT, state TEXT, zipcode TEXT, phone TEXT, email TEXT, website TEXT, productCapabilityId INTEGER, paymentTerms INTEGER, leadTime INTEGER, rate DOUBLE, deliveryFee DOUBLE)')
    .on('end', function() {
      console.log('Made table!');
    });

vendorer('vendors.csv', function(region) {
  conn.query('INSERT INTO vendors VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)', [region.primaryKey, region.names, region.address, region.city, region.state, region.zipcode, region.phone, region.email, region.website, region.productCapabilityId, region.paymentTerms, region.leadTime, region.rate, region.deliveryFee])
    .on('error', console.error);
});

