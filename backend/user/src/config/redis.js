const {createClient} = require('redis');

const redisClient = createClient({
    url : process.env.REDIS_URL ,
    PORT : process.env.REDIS_PORT
});


redisClient.connect().then(() => {
    console.log('Connected to redis upstash successfully!!!');
}).catch(console.error());

module.exports = redisClient;
