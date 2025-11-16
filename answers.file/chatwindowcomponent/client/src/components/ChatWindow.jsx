import { useState, useEffect } from "react";
import socket from "../socket";

const ChatWindow = ({ username }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {
    socket.on("chat-message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("typing", (user) => {
      setTypingUser(user);
      setTimeout(() => setTypingUser(""), 1000);
    });

    socket.on("notification", (note) => {
      setMessages(prev => [...prev, { text: note, sender: "System", timestamp: new Date() }]);
    });

    return () => socket.off();
  }, []);

  const handleSend = () => {
    if (message.trim() === "") return;
    const msg = { text: message, sender: username };
    socket.emit("chat-message", msg);
    setMessage("");
  };

  const handleTyping = () => {
    socket.emit("typing", username);
  };

  return (
    <div>
      <h2>Online Users: {onlineUsers.join(", ")}</h2>
      {typingUser && <p>{typingUser} is typing...</p>}
      <div style={{ border: "1px solid black", height: "300px", overflowY: "scroll" }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.sender}</strong>: {msg.text} <em>({new Date(msg.timestamp).toLocaleTimeString()})</em>
          </div>
        ))}
      </div>
      <input 
        value={message} 
        onChange={e => setMessage(e.target.value)} 
        onKeyPress={handleTyping} 
        placeholder="Type a message"
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default ChatWindow;
