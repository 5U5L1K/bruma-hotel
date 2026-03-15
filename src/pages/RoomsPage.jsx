import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const emptyForm = {
  room_number: "",
  capacity: "",
  comfort_level: "обычный",
  price: "",
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      setRooms(data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEdit(room) {
    setEditingId(room.id);
    setForm({
      room_number: room.room_number || "",
      capacity: String(room.capacity || ""),
      comfort_level: room.comfort_level || "обычный",
      price: String(room.price || ""),
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const payload = {
      room_number: form.room_number,
      capacity: Number(form.capacity),
      comfort_level: form.comfort_level,
      price: Number(form.price),
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("rooms")
          .update(payload)
          .eq("id", editingId);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from("rooms").insert([payload]);

        if (error) {
          throw error;
        }
      }

      resetForm();
      fetchRooms();
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm("Удалить номер?");
    if (!ok) return;

    try {
      const { error } = await supabase.from("rooms").delete().eq("id", id);

      if (error) {
        throw error;
      }

      if (editingId === id) {
        resetForm();
      }

      fetchRooms();
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div>
      <h1>Номера</h1>

      {loading ? <p>Загрузка...</p> : null}
      {error ? <p>{error}</p> : null}

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>ID</th>
            <th>Номер</th>
            <th>Количество человек</th>
            <th>Комфортность</th>
            <th>Цена</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td>{room.id}</td>
              <td>{room.room_number}</td>
              <td>{room.capacity}</td>
              <td>{room.comfort_level}</td>
              <td>{room.price}</td>
              <td>
                <button onClick={() => handleEdit(room)}>Изменить</button>
                <button onClick={() => handleDelete(room.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{editingId ? "Редактирование номера" : "Добавление номера"}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            name="room_number"
            value={form.room_number}
            onChange={handleChange}
            placeholder="Номер"
            required
          />
        </div>

        <div>
          <input
            name="capacity"
            type="number"
            value={form.capacity}
            onChange={handleChange}
            placeholder="Количество человек"
            required
          />
        </div>

        <div>
          <select
            name="comfort_level"
            value={form.comfort_level}
            onChange={handleChange}
          >
            <option value="люкс">люкс</option>
            <option value="полулюкс">полулюкс</option>
            <option value="обычный">обычный</option>
          </select>
        </div>

        <div>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Цена"
            required
          />
        </div>

        <div>
          <button type="submit">
            {editingId ? "Сохранить изменения" : "Добавить"}
          </button>
          <button type="button" onClick={resetForm}>
            Очистить
          </button>
        </div>
      </form>

      <div style={{ marginTop: "24px" }}>
        <Link to="/clients">
          <button>Клиенты</button>
        </Link>
        <Link to="/operations">
          <button>Операции</button>
        </Link>
        <button onClick={handleLogout}>Выйти</button>
      </div>
    </div>
  );
}
