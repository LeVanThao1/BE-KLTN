// var distance = require('google-distance');
// distance.apiKey = 'AIzaSyDrE2W81RzSSNb-tw22IOlOS_scVXYVEnY';
// distance.get(
//     {
//         origin: '32 Lê Văn Đức, Hoà Cường Nam, Hải Châu, Đà Nẵng',
//         destination:
//             '14 phan trọng tuệ, hòa cường, hòa cường nam, hải châu, đà nẵng',
//     },
//     function (err, data) {
//         if (err) return console.log(err);
//         console.log(data);
//     }
// );
const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'google',

    // Optional depending on the providers
    apiKey: 'AIzaSyDrE2W81RzSSNb-tw22IOlOS_scVXYVEnY', // for Mapquest, OpenCage, Google Premier
    formatter: null, // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

// Using callback
const test = async () => {
    const [{ latitude, longitude }] = await geocoder.geocode(
        '24 Lê Văn Đức, Hòa Cường, Hòa Cường Nam, Hải Châu, Đà Nẵng'
    );
    // console.log(res[0].latitude, res[0].longitude);
    console.log(latitude, longitude);
};

test();

// function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
//     var R = 6371; // Radius of the earth in km
//     var dLat = deg2rad(lat2 - lat1); // deg2rad below
//     var dLon = deg2rad(lon2 - lon1);
//     var a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(deg2rad(lat1)) *
//             Math.cos(deg2rad(lat2)) *
//             Math.sin(dLon / 2) *
//             Math.sin(dLon / 2);
//     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     var d = R * c; // Distance in km
//     return d;
// }

// function deg2rad(deg) {
//     return deg * (Math.PI / 180);
// }
// console.log(
//     getDistanceFromLatLonInKm(16.0332926, 108.2195367, 12.8604668, 108.2597803)
// );
