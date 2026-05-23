const { Server } = require('socket.io');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);

const io = new Server(server , {
      cors:{
        origin : "*",
        methods:['GET','POST']
      }
});

const userSocketMap = {};

io.on("connection",(socket) =>{

      console.log("User Connected",socket.id);

      socket.on("disconnected" , () =>{
        console.log("User Disconnected" , socket.id);
      });

      socket.on("connect_error" , (error) => {
         console.log("Socket connected Error" , error)
      })
});

module.exports = { app, server,io };