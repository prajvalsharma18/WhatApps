# WhatApps

A scalable real-time chat application built with **Next.js and Node.js microservices**, featuring OTP authentication, Redis-backed rate limiting, RabbitMQ-based email processing, Socket.IO real-time messaging, MongoDB persistence, Cloudinary media uploads, and AWS EC2 deployment.

## Overview

WhatApps follows a service-oriented backend architecture with three independent services:

* **User Service** — authentication, OTP, JWT, profiles, and rate limiting
* **Chat Service** — conversations, messages, media, and real-time communication
* **Mail Service** — asynchronous OTP email delivery using RabbitMQ

```text
                        Next.js
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
        User Service              Chat Service
              │                         │
         ┌────┼────┐               ┌────┴────┐
         ▼    ▼    ▼               ▼         ▼
       Redis RabbitMQ           MongoDB   Socket.IO
         │      │
         │      ▼
         │  Mail Service
         │      │
         ▼      ▼
       OTP     SMTP
   + Rate Limit
```

## Features

* Email-based OTP authentication
* JWT-based session management
* Redis OTP storage with TTL
* Redis-based login/OTP rate limiting
* Real-time chat with Socket.IO
* MongoDB message persistence
* Image uploads through Cloudinary
* RabbitMQ asynchronous email processing
* Microservice-based backend
* AWS EC2 deployment

<img width="1926" height="817" alt="aws" src="https://github.com/user-attachments/assets/cb4b5db8-0fb2-47ba-abca-c2b3be522aa7" />


# Backend Architecture

## User Service

Handles login, OTP generation and verification, JWT issuance, user profiles, and authentication rate limiting.

```text
Login
  │
  ▼
User Service
  ├── Generate OTP
  ├── Store OTP in Redis
  ├── Check rate limit
  └── Publish email job
          │
          ▼
      RabbitMQ
```

After OTP verification, the User Service issues a JWT used for protected APIs.

## Redis Rate Limiting

The User Service uses a **fixed-window Redis counter** to protect OTP/login endpoints from spam and brute-force attempts.

```text
rate_limit:otp:<user>
        │
       INCR
        │
   Check limit
     ┌──┴──┐
     ▼     ▼
   ALLOW  REJECT
```

Redis provides **low-latency shared state, atomic counter updates, and automatic expiration**, allowing multiple service instances to share the same rate-limit state.

A naive:

```text
GET → CHECK → INCR
```

can suffer from a race condition when concurrent requests read the same value.

For simple counters, the atomic `INCR` result is used. When multiple Redis operations must be treated as one unit, a **Lua script** can execute them atomically.

> Redis is single-threaded, but only individual commands are atomic; multi-command business logic must be made atomic explicitly.

## RabbitMQ

OTP email delivery is asynchronous, keeping the User Service independent of SMTP performance.

```text
User Service → RabbitMQ → Mail Service → SMTP
```

This decouples authentication from email delivery and allows the Mail Service to process queued jobs independently.

## Chat Service

Handles:

* Chat creation and retrieval
* Message persistence
* JWT authentication
* Real-time communication using Socket.IO
* Image messaging

```text
Sender → Chat Service → MongoDB
                    │
                    └── Socket.IO → Receiver
```

## Data Storage

| Component  | Responsibility                          |
| ---------- | --------------------------------------- |
| MongoDB    | Users, chats, messages, persistent data |
| Redis      | OTPs, TTLs, rate-limit counters         |
| RabbitMQ   | Asynchronous email jobs                 |
| Cloudinary | Image/media storage                     |

# Tech Stack

### Frontend

* Next.js 16
* React 19
* Tailwind CSS
* Axios
* Socket.IO Client

### Backend

* Node.js
* Express.js
* MongoDB
* Redis
* RabbitMQ
* JWT
* Socket.IO
* Nodemailer
* Cloudinary

### Deployment

* AWS EC2
* SMTP
* Cloudinary

# Project Structure

```text
WhatApps/
├── backend/
│   ├── user/
│   ├── chat/
│   └── mail/
├── frontend/
│   └── my-app/
├── README.md
├── flow.txt
└── package.json
```

# Prerequisites

* Node.js 18+
* npm or yarn
* MongoDB
* Redis
* RabbitMQ
* Cloudinary account
* SMTP email provider

# Environment Variables

### User Service

```env
PORT=5000
MONGO_URL=mongodb://localhost:27017/whatapps
REDIS_URL=redis://localhost:6379
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
JWT_SECRET=your_jwt_secret
```

### Chat Service

```env
PORT=5002
MONGO_URL=mongodb://localhost:27017/whatapps
JWT_SECRET=your_jwt_secret
USER_SERVICE=http://localhost:5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Mail Service

```env
PORT=5003
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

### Frontend

Update the backend service URLs in:

```text
frontend/my-app/context/AppContext.jsx
```

# Installation

```bash
cd backend/user && npm install
cd ../chat && npm install
cd ../mail && npm install
cd ../../frontend/my-app && npm install
```

# Running Locally

Run each service in a separate terminal:

```bash
cd backend/user && npm run dev
cd backend/chat && npm run dev
cd backend/mail && npm run dev
cd frontend/my-app && npm run dev
```

Open:

```text
http://localhost:3000
```

# API Endpoints

### User Service

| Method | Endpoint              | Purpose                |
| ------ | --------------------- | ---------------------- |
| POST   | `/api/v1/login`       | Send OTP               |
| POST   | `/api/v1/verify`      | Verify OTP / issue JWT |
| GET    | `/api/v1/me`          | Current user           |
| GET    | `/api/v1/user/all`    | Get all users          |
| GET    | `/api/v1/user/:id`    | Get user               |
| POST   | `/api/v1/update/name` | Update name            |

### Chat Service

| Method | Endpoint                  | Purpose            |
| ------ | ------------------------- | ------------------ |
| POST   | `/api/v1/chat/new`        | Create chat        |
| GET    | `/api/v1/chat/all`        | Get chats          |
| POST   | `/api/v1/message`         | Send message/image |
| GET    | `/api/v1/message/:chatId` | Get messages       |

# Authentication Flow

```text
                         Login
                           │
                           ▼
                     User Service
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
             Redis                Rate Limit
            OTP Store               Counter
                │
                ▼
             RabbitMQ
                │
                ▼
           Mail Service
                │
                ▼
               SMTP
                │
                ▼
            User Email

User enters OTP
       │
       ▼
User Service
       │
       ├── Validate OTP
       ├── Remove/expire OTP
       └── Issue JWT
```

# AWS EC2 Deployment

The application is deployed on **AWS EC2**, with the frontend and backend services running as separate processes.

```text
Internet
   │
   ▼
AWS EC2
 ├── Next.js
 ├── User Service
 ├── Chat Service
 └── Mail Service
        │
   ┌────┼─────┐
   ▼    ▼     ▼
 Redis RabbitMQ MongoDB
```

Production deployment should use:

* Environment-based secrets
* AWS Security Groups for port restrictions
* HTTPS / reverse proxy such as Nginx
* Automatic process restarts and health checks
* Private access for internal service ports where possible

# Future Enhancements

* **Advanced rate limiting:** Sliding Window, Token Bucket, and Leaky Bucket
* Group chats and admin controls
* Typing indicators, read receipts, and online presence
* Push notifications
* Message search
* Video, document, and audio attachments
* Centralized logging, metrics, and distributed tracing
* Horizontal service scaling
* API Gateway for routing, authentication, and rate limiting

# Author

Built as a backend-focused real-time messaging project exploring **microservices, Redis, distributed rate limiting, RabbitMQ, real-time communication, and AWS deployment**.

Built as a backend-focused real-time messaging project exploring **microservices, Redis, distributed rate limiting, RabbitMQ, real-time communication, and AWS deployment**.

