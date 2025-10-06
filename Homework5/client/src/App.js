import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomeBooks from "./components/Books/HomeBooks";
import CreateBooks from "./components/Books/CreateBooks";
import UpdateBooks from "./components/Books/UpdateBooks";
import ChatPage from "./components/Chat/ChatPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeBooks />} />
        <Route path="/create" element={<CreateBooks />} />
        <Route path="/update/:id" element={<UpdateBooks />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}
