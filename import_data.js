var webCrawl = require('./web-crawl');  
var mongoose = require('./mongoose');
var apartmentData = require('./data-files/allApartmentData.json');

for(var i = 0, len = apartmentData.length; i < len; i++) {

  setTimeout(function(apartment){
    // mongoose(apartment);
    webCrawl.getApartmentImgs(apartment.img, apartment.name);
  }, 1000 * i, apartmentData[i]);

}
        
        
        
        
        