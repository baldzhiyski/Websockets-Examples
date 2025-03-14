const socket = io("ws://localhost:8080");

const clientsTotal = document.getElementById("client-total");

const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const messageTone = new Audio("/message-tone.mp3");

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

function sendMessage() {
  if (messageInput.value === "") return;
  // console.log(messageInput.value)
  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };
  socket.emit("message", data);
  addMessageToUI(true, data);
  messageInput.value = "";
}

function addMessageToUI(isOwnMessage, data) {
  clearFeedback();
  const options = {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  const formattedDate = new Intl.DateTimeFormat("en-GB", options).format(
    new Date(data.dateTime) // Convert back to Date
  );
  const element = `<li class=${isOwnMessage ? "message-right" : "message-left"}>
          <p class="message">
            ${data.message}
            <span>${data.name} ●  ${formattedDate}</span>
          </p>
        </li>`;

  messageContainer.insertAdjacentHTML("beforeend", element);
  scrollToBottom();
}

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

socket.on("clients-total", (data) => {
  // Logic now to display the total count
  clientsTotal.innerText = `Total clients : ${data}`;
});

socket.on("chat-message", (data) => {
  messageTone.play().catch((error) => console.error("Playback error:", error));
  addMessageToUI(false, data);
});

socket.on("feedback", (data) => {
  clearFeedback();
  const element = `
          <li class="message-feedback">
            <p class="feedback" id="feedback">${data.feedback}</p>
          </li>
    `;
  messageContainer.insertAdjacentHTML("beforeend", element);
});

messageInput.addEventListener("focus", (e) => {
  socket.emit("feedback", {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});

messageInput.addEventListener("keypress", (e) => {
  socket.emit("feedback", {
    feedback: `✍️ ${nameInput.value} is typing a message`,
  });
});
messageInput.addEventListener("blur", (e) => {
  socket.emit("feedback", {
    feedback: "",
  });
});

function clearFeedback() {
  document.querySelectorAll("li.message-feedback").forEach((element) => {
    element.parentNode.removeChild(element);
  });
}
