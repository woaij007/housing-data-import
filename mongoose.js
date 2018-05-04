const mongoose = require('mongoose');
const credential = require('./credential.json');

mongoose.connect(credential.mongolab.dev);

const PendingApartment = mongoose.model('PendingApartment', {
    createTime: { type: Date, default: Date.now },
    name: String,
    country: { type: String, default: 'United States'},
    state: String,
    city: String,
    zipCode: String,
    address: String,
    lowestMarketRate: Number,
    about: String,
    about_zh: String,
    enableApply: { type: Boolean, default: true},
    contractType: { type: String, default: 'A: Pay per Lease'},
    officialWebsite: String
});

const FloorPlan = mongoose.model('FloorPlan', {
    createTime: { type: Date, default: Date.now },
    name: String,
    name_zh: String,
    bedroomNumber: Number,
    bathroomNumber: Number,
    availability: { type: String, default: 'Available'},
    availability_zh: { type: String, default: '尚有空房'},
    marketRate: Number,
    apartmentId: Schema.Types.ObjectId
});

module.exports = function(apartmentData) {
    var pendingApartment = {
        name: apartmentData.name,
        state: apartmentData.state,
        city: apartmentData.city,
        zipCode: apartmentData.zipCode,
        address: apartmentData.address,
        lowestMarketRate: apartmentData.lowestMarketRate,
        about: apartmentData.about,
        about_zh: apartmentData.about_zh,
        officialWebsite: apartmentData.officialWebsite
    }
    var floorPlans = apartmentData.floorPlans;
    var newPendingApartment = new PendingApartment(pendingApartment);
    PendingApartment.create(pendingApartment, function(err, pendingApartment) {
        if(err) console.log(err);
        console.log(pendingApartment);
        for(var i = 0, len = floorPlans.length; i < len; i++) {
            floorPlans[i].apartmentId = pendingApartment.id;
            FloorPlan.create(floorPlans[i], function(err, floorPlan) {
                if(err) console.log(err);
                console.log(floorPlan);
            });
        }
    });
}