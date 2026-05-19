const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL,  
    socket: {
        tls: true,
        reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
        keepAlive: 5000
    }
});

redisClient.on('error', (err) => {
    console.log('Redis Error:', err.message);  
});

redisClient.connect().then(() => {
    console.log('Connected to redis upstash successfully!!!');
}).catch((err) => {   
    console.log('Redis connection failed:', err.message);
});

module.exports = redisClient;