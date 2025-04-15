const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://roomzyy-alpha.vercel.app', // ✅ Removed trailing slash
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', ({ roomId, user }) => {
    socket.join(roomId);
    console.log(`${user} joined room: ${roomId}`);
    socket.to(roomId).emit('userJoined', { user });
  });

  socket.on('leaveRoom', ({ roomId, user }) => {
    socket.leave(roomId);
    socket.to(roomId).emit('userLeft', { user });
    console.log(`${user} left room: ${roomId}`);
  });

  socket.on('playVideo', ({ roomId, video }) => {
    socket.to(roomId).emit('playVideo', { video });
    console.log(`Playing video in room ${roomId}`);
  });

  socket.on('play', ({ roomId }) => {
    socket.to(roomId).emit('play');
    console.log(`Play event in room ${roomId}`);
  });

  socket.on('pause', ({ roomId }) => {
    socket.to(roomId).emit('pause');
    console.log(`Pause event in room ${roomId}`);
  });

  socket.on('volumeChange', ({ roomId, volume }) => {
    socket.to(roomId).emit('volumeChange', volume);
    console.log(`Volume changed in room ${roomId} to ${volume}`);
  });

  socket.on('syncRequest', ({ roomId }) => {
    socket.to(roomId).emit('syncRequest'); // ask someone in the room to send current state
    console.log(`Sync requested in room ${roomId}`);
  });

  socket.on('syncState', ({ roomId, video, isPlaying, volume }) => {
    socket.to(roomId).emit('syncState', { video, isPlaying, volume });
    console.log(`Sync state sent to room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
