import axios from "axios";
// with proxy, the browser calls /api/... and Vite forwards to 8000
const api = axios.create({ baseURL: "" });

export const listTasks  = (params) => api.get("/api/tasks", { params }).then(r => r.data);
export const createTask = (data)   => api.post("/api/tasks", data).then(r => r.data);
export const updateTask = (id,d)   => api.put(`/api/tasks/${id}`, d).then(r => r.data);
export const deleteTask = (id)     => api.delete(`/api/tasks/${id}`).then(r => r.data);

export default api;
