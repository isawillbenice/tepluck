var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var Q = require('q');


var products = [];
var products_promise = [];

var urls = [
    'http://www.teplo-com.ru/katalog/armatura-oventrop/dlja-otopitelnyh-priborov/termostaty-20667'
];


var getProducts = function(i, url) {
    var defer = Q.defer();

    request(
        {
            uri: url,
            method: 'GET',
            encoding: 'utf8'
        },
        function(err, res, page) {
            var $ = cheerio.load(page);

            var content = $('table > tbody > tr', $('table > tbody > tr'));
            var tr_count = $('table > tbody > tr', $('table > tbody > tr')).length;

            products[i] = [];

            for (var tr = 1; tr < tr_count; tr++) {
                products[i].push({
                    'item': {
                        'artikul': $('td', content.eq(tr)).eq(0).text(),
                        'name': $('td', content.eq(tr)).eq(1).text(),
                        'desc': $('td', content.eq(tr)).eq(2).text()
                    }
                });
            }

            defer.resolve();
        }
    );

    return defer.promise;
};

var parseProducts = function() {
    var urls_count = urls.length;

    for (var i = 0; i < urls_count; i++) {
        products_promise.push(getProducts(i, urls[i]));
    }

    Q.all(products_promise).then(function() {
        var full_info = '';

        for (var i = 0; i < urls_count; i++) {

            var products_count = products[i].length;

            for (var pr = 0; pr < products_count; pr++) {
                full_info += products[i][pr]['item']['artikul'] + ';' + products[i][pr]['item']['name'] + ';' + products[i][pr]['item']['desc'] + ';\r\n';
            }
        }

        fs.writeFile('products.csv', full_info, function(err) {
            if (err) return console.log(err);
            console.log('products.csv is written');
        });
    });

}();