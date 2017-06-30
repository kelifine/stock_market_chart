'use strict';
var pug = require('pug');
var path = require('path');
var yahooFinance = require('yahoo-finance');
var Highcharts = require('highcharts/highstock');
var bodyParser = require('body-parser');


module.exports = function (io, app) {

app.use(bodyParser.urlencoded({ extended: true }));	

var date = new Date();
var end = Date.parse(date);
var start = end -  31556952000;
var today = new Date().toJSON().substr(0, 10);
var year = today.substr(0,4)-1;
var old = String(year).concat(today.substr(4));
var dataObjects = [];
var symbols = [];


function getStock(company, callback) {
	yahooFinance.historical({
		 symbol: company,
		from: old,
		to: today,
		period: 'd'}, function(err, quotes) {
			if (err) return console.log(err);
			var stock = [];
			quotes.forEach(function(element) {
				var point = [];
				point.push(element.date.getTime());
				point.push(element.adjClose);
				stock.unshift(point);
			});
			var object = {
				name: company,
				data: stock,
			};
			dataObjects.push(object);
			callback();
		});
}

function getName(company, callback) {
	yahooFinance.snapshot({
		symbol: company,
		fields: ['n']
	}, function(err, snapshot) {
		if (err) return console.log(err);
		var profile = {
			ticker: company,
			name: snapshot.name
		};
		symbols.push(profile);
		callback();
	});
}

getStock('AMZN', function() {
});

app.get('/', function(req, res){
	var main = pug.renderFile(path.join(__dirname, '../../pug/stockchart.pug'), {stocks: dataObjects, from: start, end: end});
	res.send(main);
	});
	


io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('add company', function(symbol){
    getName(symbol, function() {
    	getStock(symbol, function() {
			io.emit('add company', dataObjects, symbols);
			});
    });
  });
  socket.on('removeCompany', function(company) {
  	console.log(company);
  	dataObjects.forEach(function(object, index) {
  		if (object.name===company) {
  			dataObjects.splice(index, 1);
  			console.log(dataObjects);
  		}
  	});
  	symbols.forEach(function(symbol, index) {
  	if (symbol.ticker ===company) {
  		symbols.splice(index, 1);
  		console.log(symbols);
  	}	
  	});
  });
    
});


};
