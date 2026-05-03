const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');

connectDB();

const app = express();

const PORT = process.env.PORT ; 

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});