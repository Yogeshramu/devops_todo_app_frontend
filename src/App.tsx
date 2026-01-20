import { useEffect, useState, useCallback } from "react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const fetchTodos = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/todos`);
      const data: Todo[] = await res.json();
      setTodos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      setTodos([]);
    }
  }, [BACKEND_URL]);

  const addTodo = async (): Promise<void> => {
    if (!newTodo) return;
    const res = await fetch(`${BACKEND_URL}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTodo }),
    });
    const data: Todo = await res.json();
    setTodos(prev => [...prev, data]);
    setNewTodo("");
  };

  const updateTodo = async (id: number, title: string): Promise<void> => {
    const res = await fetch(`${BACKEND_URL}/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data: Todo = await res.json();
    setTodos(prev => prev.map(t => (t.id === data.id ? data : t)));
  };

  const deleteTodo = async (id: number): Promise<void> => {
    await fetch(`${BACKEND_URL}/api/todos/${id}`, {
      method: "DELETE",
    });
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const toggleTodo = async (id: number): Promise<void> => {
    const res = await fetch(`${BACKEND_URL}/api/todos/${id}/toggle`, {
      method: "PATCH",
    });
    const data: Todo = await res.json();
    setTodos(prev => prev.map(t => (t.id === data.id ? data : t)));
  };

  const startEdit = (todo: Todo): void => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const saveEdit = async (): Promise<void> => {
    if (editingId && editTitle.trim()) {
      await updateTodo(editingId, editTitle.trim());
      setEditingId(null);
      setEditTitle("");
    }
  };

  const cancelEdit = (): void => {
    setEditingId(null);
    setEditTitle("");
  };

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Todo App</h1>
        
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
            placeholder="Enter todo"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={addTodo}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>

        <ul className="space-y-2">
          {Array.isArray(todos) && todos.map(todo => (
            <li key={todo.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
              {editingId === todo.id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded"
                  />
                  <button onClick={saveEdit} className="px-2 py-1 bg-green-500 text-white rounded text-sm">Save</button>
                  <button onClick={cancelEdit} className="px-2 py-1 bg-gray-500 text-white rounded text-sm">Cancel</button>
                </>
              ) : (
                <>
                  <span
                    className={`flex-1 cursor-pointer ${
                      todo.completed ? "line-through text-gray-500" : "text-gray-800"
                    }`}
                    onClick={() => toggleTodo(todo.id)}
                  >
                    {todo.title}
                  </span>
                  <button onClick={() => startEdit(todo)} className="px-2 py-1 bg-blue-500 text-white rounded text-sm">Edit</button>
                  <button onClick={() => deleteTodo(todo.id)} className="px-2 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;