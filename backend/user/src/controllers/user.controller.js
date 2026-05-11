const User = require("../model/user.model");
const TryCatch = require("../utils/TryCatch");
const redisClient = require("../config/redis");
const generateToken = require("../utils/generateToken");
const {publishToQueue} = require("../config/rabbitmq");

// logining my user
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

    await redisClient.set(rateLimitKey , "1" , {
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


//verifying via otp and token in req.body
const verifyUser = TryCatch(async (req , res) =>{
       
    const {email , otp : enteredOtp} = req.body;

    if(!email || !enteredOtp){
        res.status(400).json({
            message : "Email and otp are required."
        });
        return;
    }

    const otpKey = `otp:${email}`;

    const storedOtp = await redisClient.get(otpKey);
     
     if(!storedOtp || storedOtp !== enteredOtp){
        res.status(400).json({
            message : "Invalid or expired OTP."
        });
        return;
     }
     
     await redisClient.del(otpKey);

     let user = await User.findOne({email});

     if(!user){

        const name = email.slice(0,8);

        user = await User.create({name , email});
     }

     const token = generateToken(user._id); 

     res.json({
        message : "User verified successfully.",
        user,
        token
     })
});


// generating my profile while using middleware for authentication and authorization in routes
const myProfile = TryCatch(async(req , res) =>{
    const user = await User.findById(req.user.userId);
    res.json({user});
});


//updating my name while using middleware for authentication and authorization in routes
const updateName = TryCatch(async(req , res) =>{
    const user = await User.findById(req.user?.userId);

    if(!user){
        res.status(404).json({
            message: "Please Login."
        })
        return;
    }

    user.name = req.body.name || user.name;

    await user.save();

    const token = generateToken(user._id);

    res.json({
        message : "Name updated successfully.",
        user,
        token
    });
});


//getting all users
const getAllUsers = TryCatch(async(req , res) =>{
    const users = await User.find();
    res.json({users});
});

//getting a user
const getAUser = TryCatch(async(req , res) =>{
    const user = await User.findById(req.params.id);
    res.json({user});
});

module.exports = {
    loginUser,
    verifyUser,
    myProfile,
    updateName,
    getAllUsers,
    getAUser
};