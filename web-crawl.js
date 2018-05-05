var Crawler = require("crawler");
var fs = require('fs');

var c = new Crawler({
    // maxConnections: 20,
    rateLimit: 1000,
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            console.log($("title").text());
        }
        done();
    }
});

var _getApartmentJson = function(url, cb) {
    var complete = 0;
    var apartment = {};

    c.queue({
        uri: url,
        callback: function(error, res, done) {
            if(error) {
                console.log(error);
            } else {
                var $ = res.$;
                apartment.name = $('h1.hero-banner__property').text().trim();
                var wholeAddress = $('span.about__feature-text').first().text().trim();
                apartment.address = wholeAddress.split(',')[0].trim();
                apartment.city = wholeAddress.split(',')[1].trim();
                apartment.zipCode = wholeAddress.split(',')[2].trim();
                if(wholeAddress.split(',').length === 4) {
                    apartment.city = wholeAddress.split(',')[2].trim();
                    apartment.zipCode = wholeAddress.split(',')[3].trim();
                }
                apartment.lowestMarketRate = Number($('span.hero-banner__price-number').text().replace(/\$|,/g,''));
    
                var about_title = $('h2.about__title').text().trim();
                var about_summary = $('span.about__summary-text').text().trim();
                if(about_title !== '') {
                    apartment.about = about_title + '. ';
                }else {
                    apartment.about = '';
                }
                apartment.about += about_summary;
    
                apartment.officialWebsite = url;
    
                var imgList = [];
                $('div.gallery__wrapper.swiper-wrapper').find('div > div > img').each(function (index, element) {
                    var imgUrl = $(element).attr('src') ? $(element).attr('src') : $(element).attr('data-src');
                    imgList.push(imgUrl);
                });
                apartment.img = imgList;
    
                var floorPlans = [];
                $('div.room-matrix__categories').find('div.room-matrix__room-content').each(function(index, element) {
                    var floorPlan = {};
                    var floorPlanName = $(element).find('h4.room-matrix__room-name-text').text().trim();
                    var floorPlanPrice = Number($(element).find('span.room-matrix__price').first().text().replace(/\$|,/g, ''));
                    var roomNumbers = floorPlanName.match(/\d+/g);
                    if(!isNaN(floorPlanPrice)) {
                        floorPlan.name = floorPlanName;
                        floorPlan.name_zh = floorPlanName;
                        if(roomNumbers === null) {
                            floorPlan.bedroomNumber = 0;
                            floorPlan.bathroomNumber = 1;
                        }
                        if(roomNumbers && roomNumbers.length === 2) {
                            floorPlan.bedroomNumber = Number(roomNumbers[0]);
                            floorPlan.bathroomNumber = Number(roomNumbers[1]);
                        }
                        floorPlan.marketRate = floorPlanPrice;
                        floorPlans.push(floorPlan);
                    }
                });
                apartment.floorPlans = floorPlans;
            }
            complete++;
            done();
        }
    });

    c.queue({
        uri: url.replace('www', 'cn'),
        callback: function(error, res, done) {
            if(error) {
                console.log(error);
            } else {
                var $ = res.$;    
                var about_title_zh = $('h2.about__title').text().trim();
                var about_summary_zh = $('span.about__summary-text').text().trim();
                if(about_title_zh !== '') {
                    apartment.about_zh = about_title_zh + '. ';
                } else {
                    apartment.about_zh = '';
                }
                apartment.about_zh += about_summary_zh;

            }
            complete++;
            done();
        }
    })

    var waitForApartmentData = setInterval(function(){
        if(complete === 2) {
            clearInterval(waitForApartmentData);
            cb(null, apartment);
        }
    }, 100);
}

var crawlImg = new Crawler({
    encoding:null,
    jQuery:false,// set false to suppress warning message.
    callback:function(err, res, done){
        if(err){
            console.error(err.stack);
        }else{
            if(!fs.existsSync(res.options.apartmentname)) {
                fs.mkdirSync(res.options.apartmentname);
            }  
            fs.createWriteStream(res.options.apartmentname + '/' + res.options.filename).write(res.body);
        }
        
        done();
    }
});

var _getApartmentImgs = function(imgUrls, apartmentName) {
    imgUrls.forEach(function(imgUrl) {
        var imgUrlDirs = imgUrl.split('/');
        crawlImg.queue({
            uri: 'https:' + imgUrl,
            filename: imgUrlDirs[imgUrlDirs.length - 1],
            apartmentname: apartmentName
        })
    });
}

module.exports = {
    getApartmentJson: _getApartmentJson,
    getApartmentImgs: _getApartmentImgs
};