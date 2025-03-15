const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

app.use(cors());
const port = process.env.PORT || 8080;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`Client ${socket.id} joined room: ${data}`);
  });

  // Modified send_message to include sender's name
  socket.on("send_message", (data) => {
    // Broadcast message to the room with sender's name and message
    socket.to(data.room).emit("receive_message", {
      message: data.message,
      sender: data.sender, // Include sender's name
    });
    console.log(
      `Message sent to room ${data.room}: ${data.message} from ${data.sender}`
    );
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
