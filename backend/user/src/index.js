const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const redisClient = require('./config/redis');
const userRoutes = require('./routes/user.routes');
const {connectRabbitMQ} = require('./config/rabbitmq');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1' , userRoutes);

const PORT = process.env.PORT ; 
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
