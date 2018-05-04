var XLSX = require('xlsx');
var webCrawl = require('./web-crawl');
var workbook = XLSX.readFile('data-files/Student.com_ApartmentList.xlsx');
var sheet_name_list = workbook.SheetNames;

function getApartmentUrls() {
    var apartments = {};
    for(var i = 0, len = sheet_name_list.length; i < len; i++){
        var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[i]]);
        for(var j = 0, dataLen = xlData.length; j < dataLen; j++) {
            if(xlData[j]['URL'] && !(xlData[j]['URL'] in apartments) && xlData[j]['__EMPTY']) {
                apartments[xlData[j]['URL']] = xlData[j]['__EMPTY'];
            }
        }
    }
    return apartments;
}

var apartmentUrls = getApartmentUrls();

for(var url in apartmentUrls) {
    webCrawl(url, function(err, apartmentData){
        console.log(apartmentData);
    });
}