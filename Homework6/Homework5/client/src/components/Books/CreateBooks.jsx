import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createBook } from "../../redux/booksSlice";
import { useNavigate } from "react-router-dom";

export default function CreateBook(){
  const [form, setForm] = useState({ title:"", isbn:"", publication_year:2020, available_copies:1, author_id:1 });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submit = async (e)=>{
    e.preventDefault();
    await dispatch(createBook(form));
    navigate("/");
  };

  return (
    <div className="container mt-4">
      <h2>Create Book</h2>
      <form onSubmit={submit}>
        {/* simple inputs */}
        <input className="form-control mb-2" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
        <input className="form-control mb-2" placeholder="ISBN" value={form.isbn} onChange={e=>setForm({...form, isbn:e.target.value})}/>
        <input className="form-control mb-2" type="number" placeholder="Year" value={form.publication_year} onChange={e=>setForm({...form, publication_year:+e.target.value})}/>
        <input className="form-control mb-2" type="number" placeholder="Copies" value={form.available_copies} onChange={e=>setForm({...form, available_copies:+e.target.value})}/>
        <input className="form-control mb-3" type="number" placeholder="Author ID" value={form.author_id} onChange={e=>setForm({...form, author_id:+e.target.value})}/>
        <button className="btn btn-success">Save</button>
      </form>
    </div>
  );
}
