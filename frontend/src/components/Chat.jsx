import React, { useState } from "react";

const Chat = ({ messages, onSend }) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim() === "") return;
    onSend(newMessage);
    setNewMessage("");
  };

  return (
    <div className="border rounded p-4 flex flex-col h-64">
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map((msg, index) => (
          <div key={index} className="mb-1">
            <strong>{msg.sender}: </strong>{msg.text}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          className="flex-1 border rounded px-2"
          placeholder="Digite sua mensagem..."
        />
        <button onClick={handleSend} className="ml-2 bg-blue-500 text-white px-4 rounded hover:bg-blue-600">
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Chat;