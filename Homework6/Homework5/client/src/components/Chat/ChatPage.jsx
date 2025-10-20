//import React from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";

export default function ChatPage() {
  return (
    <div className="container-fluid mt-3">
      <div className="d-flex border rounded" style={{ minHeight: "80vh" }}>
        <ChatSidebar />
        <div className="d-flex flex-column" style={{ flex: 1 }}>
          <ChatWindow />
          <MessageInput />
        </div>
      </div>
    </div>
  );
}
