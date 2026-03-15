import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const emptyForm = {
  last_name: "",
  first_name: "",
  middle_name: "",
  passport_data: "",
  comment: "",
};

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      setClients(data || []);
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

  function handleEdit(client) {
    setEditingId(client.id);
    setForm({
      last_name: client.last_name || "",
      first_name: client.first_name || "",
      middle_name: client.middle_name || "",
      passport_data: client.passport_data || "",
      comment: client.comment || "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      if (editingId) {
        const { error } = await supabase
          .from("clients")
          .update(form)
          .eq("id", editingId);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from("clients").insert([form]);

        if (error) {
          throw error;
        }
      }

      resetForm();
      fetchClients();
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm("Удалить клиента?");
    if (!ok) return;

    try {
      const { error } = await supabase.from("clients").delete().eq("id", id);

      if (error) {
        throw error;
      }

      if (editingId === id) {
        resetForm();
      }

      fetchClients();
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div>
      <h1>Клиенты</h1>

      {loading ? <p>Загрузка...</p> : null}
      {error ? <p>{error}</p> : null}

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>ID</th>
            <th>Фамилия</th>
            <th>Имя</th>
            <th>Отчество</th>
            <th>Паспорт</th>
            <th>Комментарий</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td>{client.id}</td>
              <td>{client.last_name}</td>
              <td>{client.first_name}</td>
              <td>{client.middle_name}</td>
              <td>{client.passport_data}</td>
              <td>{client.comment}</td>
              <td>
                <button onClick={() => handleEdit(client)}>Изменить</button>
                <button onClick={() => handleDelete(client.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{editingId ? "Редактирование клиента" : "Добавление клиента"}</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            placeholder="Фамилия"
            required
          />
        </div>

        <div>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            placeholder="Имя"
            required
          />
        </div>

        <div>
          <input
            name="middle_name"
            value={form.middle_name}
            onChange={handleChange}
            placeholder="Отчество"
          />
        </div>

        <div>
          <input
            name="passport_data"
            value={form.passport_data}
            onChange={handleChange}
            placeholder="Паспортные данные"
            required
          />
        </div>

        <div>
          <input
            name="comment"
            value={form.comment}
            onChange={handleChange}
            placeholder="Комментарий"
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
        <Link to="/rooms">
          <button>Номера</button>
        </Link>
        <Link to="/operations">
          <button>Операции</button>
        </Link>
        <button onClick={handleLogout}>Выйти</button>
      </div>
    </div>
  );
}
