const distance = require('google-distance');
distance.apiKey = process.env.API_KEY_MAP;

const toUnsigned = (string) => {
    if (!string) {
        return '';
    }
    return string
        .replace(/[àáâãăạảấầẩẫậắằẳẵặ]/g, 'a')
        .replace(/[ÀÁÂÃĂẠẢẤẦẨẪẬẮẰẲẴẶ]/g, 'A')
        .replace(/[òóôõơọỏốồổỗộớờởỡợ]/g, 'o')
        .replace(/[ÒÓÔÕƠỌỎỐỒỔỖỘỚỜỞỠỢ]/g, 'O')
        .replace(/[èéêẹẻẽếềểễệ]/g, 'e')
        .replace(/[ÈÉÊẸẺẼẾỀỂỄỆ]/g, 'E')
        .replace(/[ùúũưụủứừửữự]/g, 'u')
        .replace(/[ÙÚŨƯỤỦỨỪỬỮỰ]/g, 'U')
        .replace(/[ìíĩỉị]/g, 'i')
        .replace(/[ÌÍĨỈỊ]/g, 'I')
        .replace(/[ýỳỵỷỹ]/g, 'y')
        .replace(/[ÝỲỴỶỸ]/g, 'Y')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '')
        .replace(/\u02C6|\u0306|\u031B/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const getDistance = (origin, destination) => {
    return new Promise((rs, rj) => {
        distance.get(
            {
                origin: origin,
                destination: destination,
            },
            function (err, data) {
                if (err) return rj(err);
                return rs(data.distanceValue);
            }
        );
    });
};

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};
module.exports = {
    toUnsigned,
    getDistance,
    getDistanceFromLatLonInKm,
};
