const mongoose = require('mongoose');

const connectDB = (async() => {

    const url = process.env.MONGO_URL;

    if(!url){
        throw new Error('mongoDB url not found!!!');
        process.exit(1);
    }

    try{
        await mongoose.connect( url , {
            name : "WhatApps"
        });
        console.log("MongoDB connected successfully!!!");
    } catch(err){
        console.error("Error while connectig to MongoDB");
        console.log(err);
        process.exit(1);
    }
});

connectDB();

module.exports = connectDB;