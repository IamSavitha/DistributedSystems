import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendMessage, fetchMessages, setActiveConversation } from "../../redux/chatSlice";

export default function MessageInput(){
  const [text, setText] = useState(""); 
  const dispatch = useDispatch();
  const { activeConversationId } = useSelector(s=>s.chat);

  const submit = async (e)=>{
    e.preventDefault();
    if(!text.trim()) return;
    // Send to backend; if conversationId is null, backend will create one.
    const res = await dispatch(sendMessage({ conversationId: activeConversationId, message: text })).unwrap();
    // Optionally refresh the thread after sending
    dispatch(setActiveConversation(res.conversation_id));
    dispatch(fetchMessages(res.conversation_id));
    setText("");
  };

  return (
    <form onSubmit={submit} className="p-2 border-top d-flex gap-2">
      <input className="form-control" placeholder="Type a message..." value={text} onChange={e=>setText(e.target.value)} />
      <button className="btn btn-success" type="submit">Send</button>
    </form>
  );
}
