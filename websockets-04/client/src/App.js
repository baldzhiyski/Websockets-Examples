import "./App.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";

// Establish socket connection to the server
const socket = io.connect("ws://localhost:8080");

function App() {
  // Room State
  const [room, setRoom] = useState("");

  // Messages States
  const [message, setMessage] = useState(1);
  const [messageReceived, setMessageReceived] = useState([]);

  // State for storing the sender's name
  const [name, setName] = useState("");

  // Function to handle joining a room
  const joinRoom = () => {
    if (room !== "") {
      socket.emit("join_room", room);
    }
  };

  // Function to send a message to the server
  const sendMessage = () => {
    if (message !== "" && name !== "") {
      // Emit the "send_message" event to the server with the message, room, and sender's name
      socket.emit("send_message", { message, room, sender: name });
    }
  };

  // Handle receiving a message from the server
  useEffect(() => {
    socket.on("receive_message", (data) => {
      // Update the message list with the new message and sender
      setMessageReceived((prevMessages) => [
        ...prevMessages,
        { message: data.message, sender: data.sender },
      ]);
    });

    // Cleanup the socket listener when the component unmounts
    return () => {
      socket.off("receive_message");
    };
  }, []);

  return (
    <div className="App">
      <div className="container">
        <h1>Socket Chat Room</h1>

        <div className="room-section">
          <input
            className="input"
            placeholder="Room Number..."
            onChange={(event) => setRoom(event.target.value)}
          />
          <button className="button" onClick={joinRoom}>
            Join Room
          </button>
        </div>

        <div className="name-section">
          <input
            className="input"
            placeholder="Enter Your Name..."
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="message-section">
          <input
            className="input"
            placeholder="Message..."
            onChange={(event) => setMessage(event.target.value)}
          />
          <button className="button" onClick={sendMessage}>
            Send Message
          </button>
        </div>

        <div className="messages-display">
          <h2>Messages:</h2>
          {messageReceived.map((msg, index) => (
            <div key={index} className="message">
              <strong>{msg.sender}: </strong>
              {msg.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
