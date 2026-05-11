const jsonwebtoken = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET

const generateToken =  (userId) =>{
    return jsonwebtoken.sign({userId} , JWT_SECRET , {
        expiresIn : "15d",
    });
}

module.exports = generateToken;