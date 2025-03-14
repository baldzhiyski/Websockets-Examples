// Create a connection to the WebSocket server running on localhost:8080
const socket = io("ws://localhost:8080");

// Listen for incoming "message" events from the WebSocket server
socket.on("message", (text) => {
  // Create a new <li> element for each incoming message
  const el = document.createElement("li");

  // Set the content of the <li> element to the received message (text)
  el.innerHTML = text;

  // Append the new <li> element to the <ul> on the webpage
  // This will add the message to the list of messages shown to the user
  document.querySelector("ul").appendChild(el);
});

// Add an event listener for when the user clicks the "button" on the webpage
document.querySelector("button").onclick = () => {
  // Get the text entered by the user in the <input> field
  const text = document.querySelector("input").value;

  // Send the text as a "message" event to the WebSocket server
  // The message will be broadcast to all connected clients
  socket.emit("message", text);
};
