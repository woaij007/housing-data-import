var Crawler = require("crawler");

module.export = function(url) {
  
  var c = new Crawler({
      maxConnections: 10,
      callback: function(error, res, done) {
          if(error) {
              console.log(error);
          } else {
              var $ = res.$;
              console.log($('h1.hero-banner__property.hero-banner__property--long').text().trim());
              console.log($('span.hero-banner__current-price').text().trim());
          }
          done();
      }
  });
  
  c.queue(url);
}