const amqplib = require('amqplib');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure : true,
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
                        from: `"WhatApps" <${process.env.EMAIL_USER}>`,                        to,
                        subject : "Your WhatApps login-code is :- ",
                        html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10);">
    
                   <!-- Header -->
                 <div style="background: #2563eb; padding: 36px 32px; text-align: center;">
                 <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 12px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                 <span style="font-size: 28px;">💬</span>
               </div>
               <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">ChatApp</h1>
            </div>

          <!-- Body -->
         <div style="padding: 40px 32px;">
        <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin: 0 0 8px 0;">Verify your email</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 32px 0;">Use the OTP below to complete your login. This code is valid for 5 minutes.</p>

        <!-- OTP Box -->
        <div style="background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 32px;">
            <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Your OTP Code</p>
            <span style="font-size: 42px; font-weight: 800; letter-spacing: 16px; color: #2563eb;">${body}</span>
        </div>

        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 12px 16px; margin-bottom: 24px;">
            <p style="color: #92400e; font-size: 13px; margin: 0;">⚠️ Do not share this code with anyone. ChatApp will never ask for your OTP.</p>
        </div>

        <p style="color: #9ca3af; font-size: 12px; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
        </div>

            <!-- Footer -->
            <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 ChatApp. All rights reserved.</p>
            </div>

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