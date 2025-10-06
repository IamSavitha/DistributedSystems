import React from "react";
import { useSelector } from "react-redux";

export default function ChatWindow(){
  const { activeConversationId, messagesByConv } = useSelector(s=>s.chat);
  const msgs = activeConversationId ? (messagesByConv[activeConversationId] || []) : [];
  return (
    <div className="p-3" style={{flex:1, overflowY:"auto", height:"70vh"}}>
      {activeConversationId === null && <p>Start a new conversation…</p>}
      {msgs.map(m=>(
        <div key={m.id} className="mb-3">
          <div><strong>{m.role}</strong></div>
          <div style={{whiteSpace:"pre-wrap"}}>{m.content}</div>
          <hr/>
        </div>
      ))}
    </div>
  );
}
