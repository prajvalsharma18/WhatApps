const TryCatch = require("../utils/TryCatch");
const redisClient = require("../config/redis");
const {publishToQueue} = require("../config/rabbitmq");


const loginUser = TryCatch(async (req , res) =>{
    const {email} = req.body;

    const rateLimitKey = `otp:ratelimit:${email}`;

    const rateLimit = await redisClient.get(rateLimitKey);

    if(rateLimit){
        res.status(429).json({
            message : "Too many requests. Please try again later for new otp!!!!."
        }); 
        return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpKey = `otp:${email}`;
    await redisClient.set( otpKey , otp , {
        EX : 300,
    });

    await redisClient.set(rateLimitKey , true , {
        EX : 60,
    });

    const message = {
        to : email,
        subject : "Your otp code",
        body : `Your otp code is ${otp}. It will expire in 5 minutes.`
    }

    await publishToQueue("send-otp", message);

    res.status(200).json({
        message : "OTP sent to your email address."
    })
});

module.exports = {
    loginUser,
};