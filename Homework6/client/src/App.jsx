// client/src/App.jsx
import { useEffect, useState } from "react";
import { listTasks, createTask, deleteTask, updateTask } from "./api";
import dayjs from "dayjs";

const chipFor = (status) => {
  if (status === "completed") return "badge green";
  if (status === "in-progress") return "badge yellow";
  return "badge blue";
};

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // <-- track which task is being edited
  const emptyForm = {
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    category: "Work",
  };
  const [form, setForm] = useState(emptyForm);
  const [q, setQ] = useState("");

  async function load(params = {}) {
    setLoading(true);
    try {
      const data = await listTasks({ q, sort: "dueDate", ...params });
      setItems(data.items || []);
    } catch (e) {
      console.error("API error:", e?.response?.data || e.message);
      alert("API error — check console");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm(emptyForm);

  const create = async (e) => {
    e.preventDefault();
    if (!form.title || !form.dueDate) {
      alert("title and dueDate are required");
      return;
    }
    await createTask(form);
    resetForm();
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this task?")) return;
    await deleteTask(id);
    load();
  };

  const beginEdit = (t) => {
    setEditingId(t.id);
    setForm({
      title: t.title,
      description: t.description || "",
      status: t.status,
      priority: t.priority,
      dueDate: dayjs(t.dueDate).format("YYYY-MM-DD"),
      category: t.category,
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.dueDate) {
      alert("title and dueDate are required");
      return;
    }
    await updateTask(editingId, form);
    setEditingId(null);
    resetForm();
    load();
  };

  return (
    <div className="container">
      <h1>Task Management App</h1>

      {/* Search + Create */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row" style={{ marginBottom: 10 }}>
          <input
            className="input"
            placeholder="Search title/description..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn" onClick={() => load({ page: 1 })}>Search</button>
        </div>

        <form onSubmit={create} className="grid">
          <input
            className="input"
            placeholder="Title *"
            value={form.title}
            onChange={(e)=>setForm(f=>({...f, title:e.target.value}))}
          />
          <input
            className="input"
            placeholder="Due Date * (YYYY-MM-DD)"
            value={form.dueDate}
            onChange={(e)=>setForm(f=>({...f, dueDate:e.target.value}))}
          />
          <input
            className="input span-2"
            placeholder="Description"
            value={form.description}
            onChange={(e)=>setForm(f=>({...f, description:e.target.value}))}
          />
          <select className="select" value={form.category} onChange={(e)=>setForm(f=>({...f, category:e.target.value}))}>
            {["Work","Personal","Shopping","Health","Other"].map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="select" value={form.status} onChange={(e)=>setForm(f=>({...f, status:e.target.value}))}>
            {["pending","in-progress","completed"].map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="select" value={form.priority} onChange={(e)=>setForm(f=>({...f, priority:e.target.value}))}>
            {["low","medium","high"].map(p=> <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="span-2">
            <button className="btn primary" type="submit">Create Task</button>
          </div>
        </form>
      </div>

      {/* Edit panel (appears only when editingId is set) */}
      {editingId && (
        <form onSubmit={saveEdit} className="grid card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Edit Task</h3>
          <input
            className="input"
            placeholder="Title *"
            value={form.title}
            onChange={(e)=>setForm(f=>({...f, title:e.target.value}))}
          />
          <input
            className="input"
            placeholder="Due Date * (YYYY-MM-DD)"
            value={form.dueDate}
            onChange={(e)=>setForm(f=>({...f, dueDate:e.target.value}))}
          />
          <input
            className="input span-2"
            placeholder="Description"
            value={form.description}
            onChange={(e)=>setForm(f=>({...f, description:e.target.value}))}
          />
          <select className="select" value={form.category} onChange={(e)=>setForm(f=>({...f, category:e.target.value}))}>
            {["Work","Personal","Shopping","Health","Other"].map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="select" value={form.status} onChange={(e)=>setForm(f=>({...f, status:e.target.value}))}>
            {["pending","in-progress","completed"].map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="select" value={form.priority} onChange={(e)=>setForm(f=>({...f, priority:e.target.value}))}>
            {["low","medium","high"].map(p=> <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="span-2 row">
            <button className="btn primary" type="submit">Save Changes</button>
            <button className="btn" type="button" onClick={() => { setEditingId(null); resetForm(); }}>Cancel</button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="card"><p>Loading…</p></div>
      ) : (
        <table className="table">
          <thead>
            <tr><th>Title</th><th>Due</th><th>Status</th><th>Priority</th><th>Category</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(t => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{dayjs(t.dueDate).format("YYYY-MM-DD")}</td>
                <td><span className={chipFor(t.status)}>{t.status}</span></td>
                <td>{t.priority}</td>
                <td>{t.category}</td>
                <td style={{ textAlign: "right", display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button className="btn" onClick={() => beginEdit(t)}>Edit</button>
                  <button className="btn" onClick={() => remove(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan="6" className="empty">No tasks found.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
