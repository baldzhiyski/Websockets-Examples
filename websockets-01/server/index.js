// Import the HTTP module to create an HTTP server.
const http = require("http").createServer();

// Import the socket.io module to enable WebSocket communication.
const io = require("socket.io")(http, {
  cors: { origin: "*" }, // Allow connections from any origin (for simplicity)
});

// This event triggers when a new user (socket) connects to the server.
io.on("connection", (socket) => {
  console.log("a user connected");

  // This event listens for the "message" event from the client.
  socket.on("message", (message) => {
    console.log(message); // Log the received message on the server.

    // Broadcast the message to all connected clients.
    // `socket.id` is used to identify the sender.
    io.emit("message", `${socket.id.substr(0, 2)} said ${message}`);
  });

  // This is an optional event that can be triggered when the socket disconnects.
  socket.on("disconnect", () => {
    console.log("a user disconnected");
  });
});

// Start the HTTP server and listen on port 8080.
http.listen(8080, () => console.log("listening on http://localhost:8080"));
