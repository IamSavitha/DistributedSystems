// client/src/redux/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000",
});

// ------------------ ASYNC THUNKS ------------------

// Fetch all conversations
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/ai/conversations");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

// Fetch all messages for a specific conversation
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId, thunkAPI) => {
    try {
      const { data } = await api.get(`/ai/messages/${conversationId}`);
      return { conversationId, messages: data };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

// Send a message (creates/continues conversation)
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ conversationId, message, model }, thunkAPI) => {
    try {
      const { data } = await api.post("/ai/chat", {
        conversation_id: conversationId,
        message,
        model,
      });
      return data; // { conversation_id, assistant_message }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

// ------------------ SLICE ------------------
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    messagesByConversation: {}, // key = conversationId
    loading: false,
    error: null,
    activeConversationId: null,
  },
  reducers: {
    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchMessages
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        state.messagesByConversation[conversationId] = messages;
      })

      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversation_id, assistant_message } = action.payload;
        if (!state.messagesByConversation[conversation_id])
          state.messagesByConversation[conversation_id] = [];
        state.messagesByConversation[conversation_id].push(assistant_message);
        state.activeConversationId = conversation_id;
        state.loading = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { setActiveConversation, clearError } = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;
