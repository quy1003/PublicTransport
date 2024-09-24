
const express = require('express');
const app = express();
const port = 5000;
const morgan = require('morgan');
const route = require('./routes/index');
const db = require('./app/config/dbconnect');
const zaloPayConfig = require('./app/config/zalopay');
const axios = require('axios').default;
const CryptoJS = require('crypto-js');
const moment = require('moment');
const qs = require('qs');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const Trip = require('./app/models/Trip')
// Import Firebase
const dbf = require('./app/config/firebase'); // Adjust the path as needed
const roomsRef = dbf.ref('rooms');
const usersRef = dbf.ref('users');
const messagesRef = dbf.ref('messages');
let busLocations = {}

let driverSockets = {}
let intervals = {}

io.on('connection', (socket) => {
  const initializeUser = async (userId, isAdmin) => {
    const userSnapshot = await usersRef.child(userId).once('value');
    if (!userSnapshot.exists()) {
      await usersRef.child(userId).set({ isAdmin });
    }
  };

  socket.on('joinChat', async (alias, userId) => {
   await initializeUser(userId, false);
   const roomId = socket.id;
   console.log('roomId (socket.id):', roomId); 
 
   await roomsRef.child(roomId).set({ alias, socketId: roomId, userId });
   await messagesRef.child(roomId).set([]);
   socket.join(roomId);
   const roomsSnapshot = await roomsRef.once('value');
   io.emit('roomList', roomsSnapshot.val());
 });

  socket.on('chatMessage', async ({ roomId, message }) => {
   const msgData = { sender: socket.id, message };
   console.log('roomId:', roomId);
   await messagesRef.child(roomId).push(msgData);
   io.to(roomId).emit('chatMessage', msgData);
 });
 

  socket.on('adminJoinRoom', async (roomId) => {
    socket.join(roomId);
    const chatHistorySnapshot = await messagesRef.child(roomId).once('value');
    const chatHistory = chatHistorySnapshot.val() || [];
    socket.emit('chatHistory', chatHistory);
  });

  socket.on('disconnect', async () => {
    const roomId = socket.id;
    await roomsRef.child(roomId).remove();
    await messagesRef.child(roomId).remove();
    const roomsSnapshot = await roomsRef.once('value');
    io.emit('roomList', roomsSnapshot.val());

    delete busLocations[socket.id];
    io.emit('busLocationsUpdate', Object.values(busLocations));
    //
    for (const driverId in driverSockets) {
      if (driverSockets[driverId] === socket.id) {
        if (intervals[driverId]) {
          clearInterval(intervals[driverId]);
          delete intervals[driverId];
        }
        delete driverSockets[driverId];
        break;
      }
    }

    //
  });

  socket.on('busLocation', (data) => {
    busLocations[socket.id] = { lat: data.lat, lng: data.lng, user: data.user };  
    io.emit('busLocationsUpdate', Object.values(busLocations));
});
socket.on('driverId', async(data) => {
  driverSockets[data] = socket.id
  if (intervals[data]) {
    clearInterval(intervals[data]);
  }
  try{
    console.log("ID: ", data)
    const fncFindTrip = async () => {
    const currentTime = new Date()
    const tripDetails = await Trip.find({
      departureTime : {$gte : currentTime},
      driver: data
    }).select('-seats')
    tripDetails.forEach(trip => {
      const timeDifference = trip.departureTime - currentTime;
      
      if (timeDifference <= 30000 && timeDifference >= 0) { 
        const driverSocketId = driverSockets[data];
        if (driverSocketId) {
          io.to(driverSocketId).emit('tripDetail', trip);
        }
      }
    });
    }
    intervals[data] = setInterval(()=>{
      fncFindTrip()
    },10000)
  }
  catch(ex){
    console.log('Something wrong!')
  }
});

});


//
app.use(cors());
require('dotenv').config();
app.use(morgan('combined'));
app.use(express.json());
db.connect();
route(app);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});
