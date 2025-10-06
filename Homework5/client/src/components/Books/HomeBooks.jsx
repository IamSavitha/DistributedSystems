import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBooks, deleteBook } from "../../redux/booksSlice";
import { useNavigate } from "react-router-dom";

export default function HomeBooks(){
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector(s=>s.books);

  useEffect(()=>{ dispatch(fetchBooks()); },[dispatch]);

  return (
    <div className="container mt-4">
      <h2>Books</h2>
      <button className="btn btn-success mb-3" onClick={()=>navigate("/create")}>Add Book</button>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      <div className="row">
        {items.map(b=>(
          <div className="col-md-4" key={b.id}>
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">{b.title}</h5>
                <p className="card-text"><strong>ISBN:</strong> {b.isbn}</p>
                <p className="card-text"><strong>Year:</strong> {b.publication_year}</p>
                <p className="card-text"><strong>Copies:</strong> {b.available_copies}</p>
                <button className="btn btn-warning me-2" onClick={()=>navigate(`/update/${b.id}`)}>Update</button>
                <button className="btn btn-danger" onClick={()=>dispatch(deleteBook(b.id))}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
