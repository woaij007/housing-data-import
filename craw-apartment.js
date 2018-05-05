var XLSX = require('xlsx');
var webCrawl = require('./web-crawl');
var workbook = XLSX.readFile('data-files/Student.comOnWeHousing.xlsx');
var sheet_name_list = workbook.SheetNames;
var fs = require('fs');

function getApartmentUrls() {
    var apartments = {};
    for(var i = 0, len = sheet_name_list.length; i < len; i++){
        var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[i]]);
        for(var j = 0, dataLen = xlData.length; j < dataLen; j++) {
            if(xlData[j]['URL'] && !(xlData[j]['URL'] in apartments) && xlData[j]['apartments'] && xlData[j]['State']) {
                apartments[xlData[j]['URL']] = {
                    state: xlData[j]['State'],
                    name: xlData[j]['apartments']
                }
            }
        }
    }
    return apartments;
}

var apartmentUrls = getApartmentUrls();
fs.writeFileSync('data-files/apartmentUrls.json', JSON.stringify(apartmentUrls, null, 2), 'utf8');
apartmentUrls = {"https://www.student.com/us/philadelphia/p/international-house": {
    "state": "PA",
    "name": "International House"
  }};

var allApartmentData = [];

for(var url in apartmentUrls) {
    webCrawl.getApartmentJson(url, function(err, apartmentData){
        apartmentData.state = apartmentUrls[url].state;
        console.log(apartmentData);
        allApartmentData.push(apartmentData);
    });
}
var waitForAllData = setInterval(function(c){
    if(allApartmentData.length === Object.keys(apartmentUrls).length) {
        fs.writeFileSync('data-files/allApartmentData1.json', JSON.stringify(allApartmentData, null, 2), 'utf8');
        console.log('allApartmentData saved');
        clearInterval(waitForAllData);
    }
},1000);