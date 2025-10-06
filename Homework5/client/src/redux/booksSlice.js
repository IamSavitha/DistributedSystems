// client/src/redux/booksSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000",
});

// THUNKS
export const fetchBooks = createAsyncThunk("books/fetchAll", async (_, thunkAPI) => {
  try { const { data } = await api.get("/books"); return data; }
  catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.detail || e.message); }
});

export const createBook = createAsyncThunk("books/create", async (payload, thunkAPI) => {
  try { const { data } = await api.post("/books", payload); return data; }
  catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.detail || e.message); }
});

export const updateBook = createAsyncThunk("books/update", async ({ id, updates }, thunkAPI) => {
  try { const { data } = await api.put(`/books/${id}`, updates); return data; }
  catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.detail || e.message); }
});

export const deleteBook = createAsyncThunk("books/delete", async (id, thunkAPI) => {
  try { await api.delete(`/books/${id}`); return id; }
  catch (e) { return thunkAPI.rejectWithValue(e.response?.data?.detail || e.message); }
});

const slice = createSlice({
  name: "books",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    // fetch
    b.addCase(fetchBooks.pending,  (s)=>{s.loading=true; s.error=null;});
    b.addCase(fetchBooks.fulfilled,(s,a)=>{s.loading=false; s.items=a.payload;});
    b.addCase(fetchBooks.rejected, (s,a)=>{s.loading=false; s.error=a.payload;});
    // create
    b.addCase(createBook.fulfilled,(s,a)=>{s.items.push(a.payload);});
    // update
    b.addCase(updateBook.fulfilled,(s,a)=>{
      const i = s.items.findIndex(x=>x.id===a.payload.id);
      if(i>-1) s.items[i]=a.payload;
    });
    // delete
    b.addCase(deleteBook.fulfilled,(s,a)=>{
      s.items = s.items.filter(x=>x.id!==a.payload);
    });
  }
});

export default slice.reducer;
