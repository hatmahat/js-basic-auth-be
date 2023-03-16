const whitelist = [
    // list ngga kena CORS
    "https://www.google.com",
    "htt://172.0.0.1:5500",
    "http://localhost:3500",
];
const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            // !origin -> undefined
            callback(null, true);
        } else {
            callback(new Error("Not allowerd by CORS"));
        }
    },
    optionsSuccessStatus: 200,
};

module.exports = corsOptions;
