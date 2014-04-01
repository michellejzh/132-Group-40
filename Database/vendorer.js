var fs = require('fs');
var csv = require('csv');

var fields = {
	0: 'primaryKey',
	1: 'name',
	2: 'address',
	3: 'city',
	4: 'state',
	5: 'zipcode',
	6: 'phone',
	7: 'email',
	8: 'website',
	9: 'productCapabilityId',
	10: 'paymentTerms',
	11: 'leadTime',
	12: 'rate',
	13: 'deliveryFee',
};
var transformers = {
	'productCapabilityId': parseFloat,
	'paymentTerms': parseFloat,
	'leadTime': parseFloat,
	'rate': parseFloat,
	'deliveryFee': parseFloat
};
function transform(row){
	var r = {};
	for(var i=0;i<row.length;i++){
		r[fields[i]] = transformers.hasOwnProperty(fields[i])?
			transformers[fields[i]](row[i]):row[i];
	};
	return r;
}

function main(file, callback){
	csv().from.stream(fs.createReadStream(file))
		.on('record', function(row, index){
			var row = transform(row);
			callback(row);
		});
}


module.exports = main;
