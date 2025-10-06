import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations, fetchMessages, setActiveConversation } from "../../redux/chatSlice";

export default function ChatSidebar(){
  const dispatch = useDispatch();
  const { conversations, activeConversationId } = useSelector(s=>s.chat);

  useEffect(()=>{ dispatch(fetchConversations()); },[dispatch]);

  return (
    <div className="p-2 border-end" style={{width: 280}}>
      <h5>Conversations</h5>
      <button className="btn btn-sm btn-primary mb-2"
        onClick={()=>dispatch(setActiveConversation(null))}>+ New Chat</button>
      <ul className="list-group">
        {conversations.map(c=>(
          <li key={c.id}
              className={`list-group-item ${activeConversationId===c.id ? "active":""}`}
              onClick={()=>{
                dispatch(setActiveConversation(c.id));
                dispatch(fetchMessages(c.id));
              }}>
            {c.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
