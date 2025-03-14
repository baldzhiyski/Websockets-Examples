// Import the HTTP module to create a basic server.
const http = require("http");

// Import WebSocketServer from the 'ws' package.
const { WebSocketServer } = require("ws");

// Define the port where the WebSocket server will run.
const port = 8000;

// Import the 'url' module to parse incoming request URLs.
const url = require("url");

// Create an HTTP server (not directly used but required for WebSocketServer).
const server = http.createServer({});

// Import 'uuid' to generate unique user IDs.
const uuid4 = require("uuid").v4;

// Create a WebSocket server that runs on the existing HTTP server.
const wsServer = new WebSocketServer({ server });

// Store active connections in an object, mapping UUIDs to WebSocket connections.
const connections = {};

// Store user information (username and state) using their UUIDs as keys.
const users = {};

// Function to broadcast user data to all connected clients.
const broadcast = () => {
  // Iterate over all active connections.
  Object.keys(connections).forEach((uuid) => {
    const connection = connections[uuid];

    // Convert the 'users' object into a JSON string to send to clients.
    const message = JSON.stringify(users);

    // Send the message to the client.
    connection.send(message);
  });
};

// Function to handle incoming messages from a client.
const handleMessage = (bytes, uuid) => {
  // Convert the received binary message to a string and parse it as JSON.
  // Expected format: { "x": 0, "y": 100 }
  const message = JSON.parse(bytes.toString());

  // Get the user associated with the UUID and update their state.
  const user = users[uuid];
  user.state = message;

  // Broadcast the updated users list to all clients.
  broadcast();

  console.log(
    `${user.username} updated their state : ${JSON.stringify(user.state)}`
  );
};

// Function to handle client disconnection.
const handleClose = (uuid) => {
  console.log(`${users[uuid].username} has disconnected !`);

  // Remove the user's connection and data when they disconnect.
  delete connections[uuid];
  delete users[uuid];

  // Notify all remaining users about the updated list of connected users.
  broadcast();
};

// Handle new WebSocket connections.
wsServer.on("connection", (connection, request) => {
  // When connecting from a client, use a URL like: ws://localhost:8000?username=Alex
  // Extract the username from the URL query parameters.
  const { username } = url.parse(request.url, true).query;
  console.log(username);

  // Generate a unique identifier for the new connection.
  const uuid = uuid4();

  // Store the WebSocket connection with its UUID.
  connections[uuid] = connection;

  // Add the user to the users list with an empty state.
  users[uuid] = {
    username: username,
    state: {},
  };

  // Set up event listeners for the WebSocket connection.

  // When a message is received from the client, handle it.
  connection.on("message", (message) => handleMessage(message, uuid));

  // When the client disconnects, clean up their data.
  connection.on("close", () => handleClose(uuid));
});

// Start the HTTP server and WebSocket server on the specified port.
server.listen(port, () => {
  console.log(`WebSocket server is running on port ${port} !`);
});
