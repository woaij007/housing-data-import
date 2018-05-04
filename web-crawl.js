var Crawler = require("crawler");

module.exports = function(url, cb) {
  
    var c = new Crawler({
        maxConnections: 10,
        callback: function(error, res, done) {
            if(error) {
                console.log(error);
                cb(error);
            } else {
                var $ = res.$;
                var apartment = {};
                apartment.name = $('h1.hero-banner__property').text().trim();
                




                return cb(null, apartment);
            }
            done();
        }
    });
    
    c.queue(url);
}