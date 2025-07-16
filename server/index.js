// index.js (backend)
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const roomNames = {};

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join-room', ({ roomId, roomName }) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.leave(room);
      }
    }

    socket.join(roomId);
    console.log(`✅ Socket ${socket.id} joined room: ${roomId}`);

    if (roomName) {
      roomNames[roomId] = roomName;
    }

    const nameToSend = roomNames[roomId] || 'Untitled Room';
    socket.emit('room-name', nameToSend);
  });

  socket.on('request-room-name', (roomId) => {
    const nameToSend = roomNames[roomId] || 'Untitled Room';
    socket.emit('room-name', nameToSend);
  });

  socket.on('draw', ({ roomId, data }) => {
    socket.to(roomId).emit('draw', data);
  });

  socket.on('clear', (roomId) => {
    socket.to(roomId).emit('clear');
  });

  socket.on('cursor-move', ({ roomId, cursor }) => {
    socket.to(roomId).emit('cursor-move', {
      socketId: socket.id,
      cursor
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
