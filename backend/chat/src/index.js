const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const chatRoutes = require('./routes/chat.routes');
const cors = require('cors');
const { app, server } = require('./config/socket');

app.use(express.json());
app.use(cors());
app.use('/api/v1/', chatRoutes);

const PORT = process.env.PORT;


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});