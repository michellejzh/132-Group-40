var anyDB = require('any-db');
var vendorer = require('./vendorer.js');

var conn = anyDB.createConnection('sqlite3://vendors.db');

conn.query('CREATE TABLE vendors (primaryKey INTEGER, name TEXT, address TEXT, city TEXT, state TEXT, zipcode TEXT, phone TEXT, email TEXT, website TEXT, productCapabilityId INTEGER, paymentTerms INTEGER, leadTime INTEGER, rate DOUBLE, deliveryFee DOUBLE)')
    .on('end', function() {
      console.log('Made table!');
    });

vendorer('vendors.csv', function(vendor) {
  conn.query('INSERT INTO vendors VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)', [vendor.primaryKey, vendor.vendorName, vendor.address, vendor.city, vendor.state, vendor.zipcode, vendor.phone, vendor.email, vendor.website, vendor.productCapabilityId, vendor.paymentTerms, vendor.leadTime, vendor.rate, vendor.deliveryFee])
    .on('error', console.error);
});

