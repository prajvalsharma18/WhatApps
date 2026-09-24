
# WhatApps - http://98.92.203.163:3000/chat

A modern real-time chat application with OTP-based authentication, multi-service backend architecture, and media-enabled messaging. Built with a Next.js frontend and a set of Node.js microservices for user management, chat operations, and email delivery.

## Overview

WhatApps is a professional messaging platform inspired by the patterns of a WhatsApp-style app, designed with a scalable microservice architecture. The system separates responsibilities across dedicated services:

- User service handles authentication, OTP generation, JWT issuance, and profile operations.
- Chat service manages conversations, message storage, and real-time communication.
- Mail service consumes queued email tasks and sends OTP emails asynchronously.
- Frontend provides the user experience for login, OTP verification, chat, and profile flows.

This design improves maintainability, decoupling, and scalability while allowing each service to evolve independently.

## Features

- Email-based login with OTP verification
- Redis-powered OTP storage and rate limiting
- JWT-based session management
- Real-time chat using Socket.IO
- Message history retrieval and conversation management
- Image upload support with Cloudinary
- RabbitMQ-based async email processing for production-friendly workflows
- Responsive UI built with Next.js and Tailwind CSS
- Modular and service-oriented backend architecture

## Tech Stack

### Frontend
- Next.js 16
- React 19
- Tailwind CSS
- Axios
- Socket communication through client-side integration

### Backend
- Node.js
- Express.js
- MongoDB
- Redis
- RabbitMQ
- JWT
- Cloudinary
- Nodemailer

## Architecture

The application uses a microservice setup with loosely coupled services:

1. User logs in from the frontend.
2. The user service validates the request and generates a 6-digit OTP.
3. OTP is stored in Redis with rate-limit protection.
4. A message is published to RabbitMQ.
5. The mail service consumes the message and sends the email through SMTP.
6. The user verifies the OTP and receives a JWT token.
7. The chat service handles conversation creation, message sending, and message retrieval using MongoDB and Socket.IO.

## Project Structure

```bash
WhatApps/
├── backend/
│   ├── chat/
│   │   ├── src/
│   │   ├── package.json
│   │   └── .env
│   ├── mail/
│   │   ├── src/
│   │   ├── package.json
│   │   └── .env
│   └── user/
│       ├── src/
│       ├── package.json
│       └── .env
├── frontend/
│   └── my-app/
│       ├── app/
│       ├── components/
│       ├── context/
│       ├── package.json
│       └── .env.local
├── README.md
├── flow.txt
└── package.json
```

## Prerequisites

Before running the app, make sure you have the following installed:

- Node.js 18+
- npm or yarn
- MongoDB
- Redis
- RabbitMQ
- Cloudinary account
- SMTP email provider (Gmail, SendGrid, etc.)

## Environment Variables

Create a `.env` file for each backend service.

### User Service (`backend/user/.env`)

```env
PORT=5000
MONGO_URL=mongodb://localhost:27017/whatapps
REDIS_URL=redis://localhost:6379
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
JWT_SECRET=your_super_secure_jwt_secret
```

### Chat Service (`backend/chat/.env`)

```env
PORT=5002
MONGO_URL=mongodb://localhost:27017/whatapps
JWT_SECRET=your_super_secure_jwt_secret
USER_SERVICE=http://localhost:5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Mail Service (`backend/mail/.env`)

```env
PORT=5003
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

### Frontend (`frontend/my-app/.env.local`)

If you are running locally, update the service URLs in [frontend/my-app/context/AppContext.jsx](frontend/my-app/context/AppContext.jsx) to match your local ports before launching the frontend.

## Installation

Install dependencies for all services:

```bash
cd backend/user && npm install
cd ../chat && npm install
cd ../mail && npm install
cd ../../frontend/my-app && npm install
```

## Running the Application

Start the services in separate terminals:

```bash
cd backend/user && npm run dev
cd backend/chat && npm run dev
cd backend/mail && npm run dev
cd frontend/my-app && npm run dev
```

Once started, open:

```bash
http://localhost:3000
```

## API Endpoints

### User Service

- `POST /api/v1/login` — send OTP to email
- `POST /api/v1/verify` — verify OTP and return JWT token
- `GET /api/v1/me` — fetch logged-in user profile
- `GET /api/v1/user/all` — get all users
- `GET /api/v1/user/:id` — get a single user
- `POST /api/v1/update/name` — update profile name

### Chat Service

- `POST /api/v1/chat/new` — create a new chat
- `GET /api/v1/chat/all` — get all chats for the authenticated user
- `POST /api/v1/message` — send a message or image
- `GET /api/v1/message/:chatId` — get messages for a chat

## Authentication Flow

```text
Frontend → User Service → Redis OTP Store → RabbitMQ → Mail Service → SMTP
                                    ↓
                              JWT issued after OTP verification
```

## Production Notes

- Use environment-specific secrets and never commit `.env` files.
- Carefully secure Redis and RabbitMQ credentials in deployment environments.
- Configure Cloudinary properly for production media uploads.
- Consider using a reverse proxy and HTTPS in production deployments.
- Set up health checks and monitoring for all microservices.

## Future Enhancements

- Group chat support
- Push notifications
- Typing indicators
- Read receipts
- Online/offline user presence
- Message search and filtering
- Admin dashboard
- File attachments beyond images


## Author

Built as a professional chat application project focused on scalable architecture, secure authentication, and real-time communication.

---

For local development, make sure the service URLs in [frontend/my-app/context/AppContext.jsx](frontend/my-app/context/AppContext.jsx) are aligned with your backend ports, and ensure MongoDB, Redis, and RabbitMQ are running before starting the app.

