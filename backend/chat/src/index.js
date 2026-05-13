const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const chatRoutes = require('./routes/chat.routes');


const app = express();
app.use(express.json());


app.use('/api/v1/', chatRoutes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

