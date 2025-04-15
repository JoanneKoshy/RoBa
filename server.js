const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://roomzyy-alpha.vercel.app/', // Replace with your frontend URL
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle room join
  socket.on('joinRoom', ({ roomId, user }) => {
    socket.join(roomId);
    console.log(`${user} joined room: ${roomId}`);

    // Send the current state to the user when they join
    io.to(roomId).emit('syncState', {
      video: null, // Set the initial video as null
      isPlaying: false,
      volume: 1
    });
  });

  // Play Video Event
  socket.on('playVideo', ({ roomId, video }) => {
    socket.to(roomId).emit('playVideo', { video });
  });

  // Pause Video Event
  socket.on('pause', (roomId) => {
    socket.to(roomId).emit('pause');
  });

  // Play Video Event
  socket.on('play', (roomId) => {
    socket.to(roomId).emit('play');
  });

  // Volume Change Event
  socket.on('volumeChange', ({ roomId, volume }) => {
    socket.to(roomId).emit('volumeChange', volume);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
