const jsonwebtoken = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET

const generateToken =  (user) =>{
    return jsonwebtoken.sign({user : user} , JWT_SECRET , {
        expiresIn : "15d",
    });
}

module.exports = generateToken;