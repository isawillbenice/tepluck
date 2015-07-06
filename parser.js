var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var Q = require('q');


var products = [];
var products_promise = [];

var urls = {
    1: 'http://www.teplo-com.ru/katalog/armatura-oventrop/dlja-otopitelnyh-priborov/termostaty-20667'
};


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

            /*            var count = $('.listitems > .item').length;

             for (var k = 0; k < count; k++) {
             products.push({
             'item': {
             'name': $('span.name > a',$('.listitems > .item')[k]).text(),
             'img': $('div > a > img',$('.listitems > .item')[k]).attr('src')
             }
             });
             }*/


            var content = $('table > tbody > tr', $('table > tbody > tr'));
            var tr_count = $('table > tbody > tr', $('table > tbody > tr')).length;

            for (var tr = 0; tr < tr_count; tr++) {
                var td_count = $('td', content[tr]).length;

                console.log(td_count);

                for (var td = 0; td < td_count - 1; td++) {


                    products.push({
                        'item': {
                            'artikul': $('td > b', content[tr]).text(),
                            'name': $('td > b', content[tr]).text(),
                            'desc': $('td', content[tr]).text()
                        }
                    });
                }

            }

            defer.resolve();
        }
    );

    return defer.promise;
};

var parseProducts = function() {
    for (i in urls) {
        products_promise.push(getProducts(i, urls[i]));
    }

    Q.all(products_promise).then(function() {
        var full_info = '';

        for (i in urls) {
            full_info += products[i]['item']['artikul'] + ';' + products[i]['item']['name'] + ';' + products[i]['item']['desc'] + ';\r\n';
        }

        fs.writeFile('products.csv', full_info, function(err) {
            if (err) return console.log(err);
            console.log('products.csv writed');
        });
    });

}();