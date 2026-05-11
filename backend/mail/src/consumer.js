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
                    <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
        
                   <h2 style="color: #111; font-size: 22px; margin: 0 0 8px 0;">Verify your email</h2>
                    <p style="color: #666; font-size: 14px; margin: 0 0 28px 0;">Use the OTP below to complete your login.</p>

                   <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 28px;">
                   <span style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #111;">${body}</span>
                   </div>

                   <p style="color: #888; font-size: 13px; margin: 0;">This OTP expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>

                  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
                  <p style="color: #bbb; font-size: 12px; margin: 0;">If you didn't request this, you can safely ignore this email.</p>

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