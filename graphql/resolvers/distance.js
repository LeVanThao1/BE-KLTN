const { ApolloError } = require('apollo-server-express');
const { getDistance } = require('../../helper/common');
module.exports = {
    Query: {
        distances: async (parent, { origin, destination }, { req }, info) => {
            try {
                const data = await Promise.all(
                    destination.map((dt) => getDistance(origin, dt))
                );
                const result = data.map((dt) => {
                    if (dt / 1000 < 5) return 0;
                    else if (dt / 1000 < 50) return 15000;
                    else if (dt / 1000 < 100) return 20000;
                    else if (dt / 1000 < 500) return 30000;
                    else return 40000;
                });
                return result;
            } catch (e) {
                return new ApolloError(e.message, 500);
            }
        },
    },
};
