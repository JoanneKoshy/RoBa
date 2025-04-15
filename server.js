const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'https://roomzyy-alpha.vercel.app', // ✅ No trailing slash
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  // Join Room
  socket.on('joinRoom', ({ roomId, user }) => {
    socket.join(roomId);
    console.log(`👤 ${user} joined room: ${roomId}`);
    socket.to(roomId).emit('userJoined', { user });

    // Initial sync state
    io.to(roomId).emit('syncState', {
      video: null,
      isPlaying: false,
      volume: 1
    });
  });

  // Leave Room
  socket.on('leaveRoom', ({ roomId, user }) => {
    socket.leave(roomId);
    socket.to(roomId).emit('userLeft', { user });
    console.log(`🚪 ${user} left room: ${roomId}`);
  });

  // Play a specific video
  socket.on('playVideo', ({ roomId, video }) => {
    socket.to(roomId).emit('playVideo', { video });
    console.log(`Playing new video in room ${roomId}`);
  });

  // Play event
  socket.on('play', ({ roomId }) => {
    socket.to(roomId).emit('play');
    console.log(` Play event in room ${roomId}`);
  });

  // Pause event — this ensures it pauses for everyone
  socket.on('pause', ({ roomId }) => {
    io.to(roomId).emit('pause'); // 🔁 Use io.to to broadcast to all, including sender if needed
    console.log(`Pause event in room ${roomId}`);
  });

  // Volume change
  socket.on('volumeChange', ({ roomId, volume }) => {
    socket.to(roomId).emit('volumeChange', volume);
    console.log(` Volume in ${roomId} set to ${volume}`);
  });

  // Sync Request
  socket.on('syncRequest', ({ roomId }) => {
    socket.to(roomId).emit('syncRequest');
    console.log(`Sync requested in room ${roomId}`);
  });

  // Sync State
  socket.on('syncState', ({ roomId, video, isPlaying, volume }) => {
    socket.to(roomId).emit('syncState', { video, isPlaying, volume });
    console.log(`Sync state broadcasted in ${roomId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
