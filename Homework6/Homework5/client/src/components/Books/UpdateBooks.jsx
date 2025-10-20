import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBooks, updateBook } from "../../redux/booksSlice";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateBook(){
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector(s=>s.books);
  const [form, setForm] = useState({ title:"", isbn:"", publication_year:2020, available_copies:1, author_id:1 });

  useEffect(()=>{
    if(items.length===0) dispatch(fetchBooks());
  },[dispatch, items.length]);

  useEffect(()=>{
    const found = items.find(b=>b.id === Number(id));
    if(found) setForm(found);
  },[items, id]);

  const submit = async (e)=>{
    e.preventDefault();
    await dispatch(updateBook({ id: Number(id), updates: form }));
    navigate("/");
  };

  return (
    <div className="container mt-4">
      <h2>Update Book</h2>
      <form onSubmit={submit}>
        <input className="form-control mb-2" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
        <input className="form-control mb-2" placeholder="ISBN" value={form.isbn} onChange={e=>setForm({...form, isbn:e.target.value})}/>
        <input className="form-control mb-2" type="number" placeholder="Year" value={form.publication_year} onChange={e=>setForm({...form, publication_year:+e.target.value})}/>
        <input className="form-control mb-2" type="number" placeholder="Copies" value={form.available_copies} onChange={e=>setForm({...form, available_copies:+e.target.value})}/>
        <input className="form-control mb-3" type="number" placeholder="Author ID" value={form.author_id} onChange={e=>setForm({...form, author_id:+e.target.value})}/>
        <button className="btn btn-primary">Update</button>
      </form>
    </div>
  );
}

