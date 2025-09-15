// src/ChatPage.jsx
import React from 'react';
import ChatCorner from './ChatCorner';
import ChatScreen from './ChatScreen';
import './ChatPage.css';
import { useParams } from 'react-router-dom';

function ChatPage() {
  const { chatId } = useParams(); // pulls ID from route (e.g., /chats/abc123)

  return (
    <div className="chat-page-container">
      <div className="chat-list">
        <ChatCorner selectedId={chatId} />
      </div>
      <div className="chat-conversation">
        {chatId ? (
          <ChatScreen chatId={chatId} />
        ) : (
          <div className="chat-placeholder">Select a chat to start messaging.</div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
