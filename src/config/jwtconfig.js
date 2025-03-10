require('dotenv').config();

module.exports = {
    secretKey: process.env.JWT_SECRET,
    tokenExpiresIn: process.env.JWT_EXPIRES_IN
};