const amqp = require('amqplib');

let connection, channel;

const connectRabbitMQ = async () =>{
    
    try{
         connection = await amqp.connect({
               protocol : "amqp",
               hostname : process.env.RABBITMQ_HOST,
               port : process.env.RABBITMQ_PORT,
               username : process.env.RABBITMQ_USER,
               password : process.env.RABBITMQ_PASSWORD
          });

          channel = await connection.createChannel();

          console.log('Connected to RabbitMQ');
    } 

    catch(err){
        console.log('Error connecting to RabbitMQ', err);
    }
};

const getChannel = () => channel;
    
const publishToQueue = async (queueName , message) =>{
    try{
        if(!channel){
           console.log("RabbitMQ channel is not initailized");
           return;
        }

        await channel.assertQueue(queueName , {durable : true});

        channel.sendToQueue(queueName , Buffer.from(JSON.stringify(message)) , {
            persistent : true,
        });

    }catch(err){
        console.log("error publishing to queue" , err);
    }
}

module.exports = {connectRabbitMQ , getChannel , publishToQueue};

connectRabbitMQ();