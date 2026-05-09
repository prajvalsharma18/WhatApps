const amqplib = require('amqplib');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const startSendOtpConsumer = async () => {
    try {
        const connection = await amqplib.connect({
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST,
            port: process.env.RABBITMQ_PORT,
            username: process.env.RABBITMQ_USER,
            password: process.env.RABBITMQ_PASSWORD
        });

        const channel = await connection.createChannel();
        const queueName = 'send-otp';

        await channel.assertQueue(queueName, { durable: true });

        console.log('Mail service is ready to consume messages');

        channel.consume(queueName, async (msg) => {
            if (msg) {
                try {
                    const { to, subject, body } = JSON.parse(msg.content.toString());

                    await transporter.sendMail({
                        from: process.env.EMAIL_FROM,
                        to,
                        subject,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #333; text-align: center;">Your OTP Code</h2>
                                <div style="background-color: #f4f4f4; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                                    <h1 style="color: #4CAF50; font-size: 40px; letter-spacing: 10px; margin: 0;">${body}</h1>
                                </div>
                                <p style="color: #666; text-align: center;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                <p style="color: #aaa; font-size: 12px; text-align: center;">If you didn't request this, please ignore this email.</p>
                            </div>
                        `
                    });

                    console.log(`OTP email sent to ${to}`);
                    channel.ack(msg); 

                } catch (err) {
                    console.log('Failed to send OTP email', err);
                    channel.nack(msg); 
                }
            }
        });

    } catch (err) {
        console.log('Failed to start RabbitMQ consumer', err);
    }
};

module.exports = { startSendOtpConsumer };