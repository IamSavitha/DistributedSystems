import { configureStore } from "@reduxjs/toolkit";
import booksReducer from "./booksSlice";
import chatReducer from "./chatSlice";

const store = configureStore({
  reducer: {
    books: booksReducer,
    chat: chatReducer,
  },
});

export default store;
