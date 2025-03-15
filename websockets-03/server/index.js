const express = require("express");
const path = require("path");

const app = express();

const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

let socketConnected = new Set();

const io = require("socket.io")(server);

io.on("connection", onConnected);

function onConnected(socket) {
  socketConnected.add(socket.id);

  io.emit("clients-total", socketConnected.size);

  socket.on("disconnect", () => {
    socketConnected.delete(socket.id);
    io.emit("clients-total", socketConnected.size);
  });

  socket.on("message", (data) => {
    socket.broadcast.emit("chat-message", data);
  });

  socket.on("feedback", (data) => {
    socket.broadcast.emit("feedback", data);
  });
}
