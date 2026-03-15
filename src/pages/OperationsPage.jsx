import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

const emptyBookingForm = {
  client_id: "",
  room_id: "",
  planned_check_in: "",
  planned_check_out: "",
  note: "",
};

const emptySettlementForm = {
  client_id: "",
  room_id: "",
  check_in_date: "",
  check_out_date: "",
  note: "",
};

const emptyClientDiscountForm = {
  client_id: "",
  discount_id: "",
};

export default function OperationsPage() {
  const [clients, setClients] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  const [bookings, setBookings] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [clientDiscounts, setClientDiscounts] = useState([]);

  const [bookingForm, setBookingForm] = useState(emptyBookingForm);
  const [settlementForm, setSettlementForm] = useState(emptySettlementForm);
  const [clientDiscountForm, setClientDiscountForm] = useState(
    emptyClientDiscountForm,
  );

  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editingSettlementId, setEditingSettlementId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      setError("");

      const [
        clientsResult,
        roomsResult,
        discountsResult,
        bookingsResult,
        settlementsResult,
        clientDiscountsResult,
      ] = await Promise.all([
        supabase.from("clients").select("*").order("id", { ascending: true }),
        supabase.from("rooms").select("*").order("id", { ascending: true }),
        supabase
          .from("discounts")
          .select("*")
          .eq("is_active", true)
          .order("id", { ascending: true }),
        supabase
          .from("bookings")
          .select(
            `
            *,
            clients(id, last_name, first_name, middle_name),
            rooms(id, room_number)
          `,
          )
          .order("id", { ascending: false }),
        supabase
          .from("settlements")
          .select(
            `
            *,
            clients(id, last_name, first_name, middle_name),
            rooms(id, room_number)
          `,
          )
          .order("id", { ascending: false }),
        supabase
          .from("client_discounts")
          .select(
            `
            *,
            clients(id, last_name, first_name, middle_name),
            discounts(id, name, discount_percent)
          `,
          )
          .order("id", { ascending: false }),
      ]);

      if (clientsResult.error) throw clientsResult.error;
      if (roomsResult.error) throw roomsResult.error;
      if (discountsResult.error) throw discountsResult.error;
      if (bookingsResult.error) throw bookingsResult.error;
      if (settlementsResult.error) throw settlementsResult.error;
      if (clientDiscountsResult.error) throw clientDiscountsResult.error;

      setClients(clientsResult.data || []);
      setRooms(roomsResult.data || []);
      setDiscounts(discountsResult.data || []);
      setBookings(bookingsResult.data || []);
      setSettlements(settlementsResult.data || []);
      setClientDiscounts(clientDiscountsResult.data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function getClientName(client) {
    if (!client) return "";
    return [client.last_name, client.first_name, client.middle_name]
      .filter(Boolean)
      .join(" ");
  }

  function handleBookingChange(event) {
    const { name, value } = event.target;
    setBookingForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSettlementChange(event) {
    const { name, value } = event.target;
    setSettlementForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleClientDiscountChange(event) {
    const { name, value } = event.target;
    setClientDiscountForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetBookingForm() {
    setEditingBookingId(null);
    setBookingForm(emptyBookingForm);
  }

  function resetSettlementForm() {
    setEditingSettlementId(null);
    setSettlementForm(emptySettlementForm);
  }

  function resetClientDiscountForm() {
    setClientDiscountForm(emptyClientDiscountForm);
  }

  function handleEditBooking(booking) {
    setEditingBookingId(booking.id);
    setBookingForm({
      client_id: String(booking.client_id || ""),
      room_id: String(booking.room_id || ""),
      planned_check_in: booking.planned_check_in || "",
      planned_check_out: booking.planned_check_out || "",
      note: booking.note || "",
    });
  }

  function handleEditSettlement(settlement) {
    setEditingSettlementId(settlement.id);
    setSettlementForm({
      client_id: String(settlement.client_id || ""),
      room_id: String(settlement.room_id || ""),
      check_in_date: settlement.check_in_date || "",
      check_out_date: settlement.check_out_date || "",
      note: settlement.note || "",
    });
  }

  async function handleBookingSubmit(event) {
    event.preventDefault();
    setError("");

    const payload = {
      client_id: Number(bookingForm.client_id),
      room_id: Number(bookingForm.room_id),
      planned_check_in: bookingForm.planned_check_in,
      planned_check_out: bookingForm.planned_check_out,
      note: bookingForm.note,
    };

    try {
      if (editingBookingId) {
        const { error } = await supabase
          .from("bookings")
          .update(payload)
          .eq("id", editingBookingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bookings")
          .insert([{ ...payload, status: "active" }]);

        if (error) throw error;
      }

      resetBookingForm();
      fetchAll();
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleSettlementSubmit(event) {
    event.preventDefault();
    setError("");

    const payload = {
      client_id: Number(settlementForm.client_id),
      room_id: Number(settlementForm.room_id),
      check_in_date: settlementForm.check_in_date,
      check_out_date: settlementForm.check_out_date,
      note: settlementForm.note,
    };

    try {
      if (editingSettlementId) {
        const { error } = await supabase
          .from("settlements")
          .update(payload)
          .eq("id", editingSettlementId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("settlements").insert([payload]);

        if (error) throw error;
      }

      resetSettlementForm();
      fetchAll();
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleClientDiscountSubmit(event) {
    event.preventDefault();
    setError("");

    const payload = {
      client_id: Number(clientDiscountForm.client_id),
      discount_id: Number(clientDiscountForm.discount_id),
    };

    try {
      const { error } = await supabase
        .from("client_discounts")
        .insert([payload]);

      if (error) throw error;

      resetClientDiscountForm();
      fetchAll();
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleDeleteBooking(id) {
    const ok = window.confirm("Удалить бронирование?");
    if (!ok) return;

    try {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
      if (editingBookingId === id) resetBookingForm();
      fetchAll();
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleDeleteSettlement(id) {
    const ok = window.confirm("Удалить поселение?");
    if (!ok) return;

    try {
      const { error } = await supabase
        .from("settlements")
        .delete()
        .eq("id", id);
      if (error) throw error;
      if (editingSettlementId === id) resetSettlementForm();
      fetchAll();
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleDeleteClientDiscount(id) {
    const ok = window.confirm("Удалить скидку клиента?");
    if (!ok) return;

    try {
      const { error } = await supabase
        .from("client_discounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchAll();
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleSettlementFromBooking(booking) {
    const ok = window.confirm("Создать поселение по брони?");
    if (!ok) return;

    try {
      const { data: existingSettlement, error: existingError } = await supabase
        .from("settlements")
        .select("id")
        .eq("booking_id", booking.id)
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingSettlement) {
        alert("Поселение по этой брони уже создано");
        return;
      }

      const { error: insertError } = await supabase.from("settlements").insert([
        {
          client_id: booking.client_id,
          room_id: booking.room_id,
          check_in_date: booking.planned_check_in,
          check_out_date: booking.planned_check_out,
          note: booking.note,
          booking_id: booking.id,
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "completed" })
        .eq("id", booking.id);

      if (updateError) {
        throw updateError;
      }

      fetchAll();
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div>
      <h1>Операции</h1>

      {loading ? <p>Загрузка...</p> : null}
      {error ? <p>{error}</p> : null}

      <h2>Бронирования</h2>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>ID</th>
            <th>Клиент</th>
            <th>Номер</th>
            <th>Дата бронирования</th>
            <th>Дата заезда</th>
            <th>Дата выезда</th>
            <th>Статус</th>
            <th>Примечание</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.id}</td>
              <td>{getClientName(booking.clients)}</td>
              <td>{booking.rooms?.room_number}</td>
              <td>{booking.booking_date}</td>
              <td>{booking.planned_check_in}</td>
              <td>{booking.planned_check_out}</td>
              <td>{booking.status}</td>
              <td>{booking.note}</td>
              <td>
                <button onClick={() => handleEditBooking(booking)}>
                  Изменить
                </button>
                <button onClick={() => handleDeleteBooking(booking.id)}>
                  Удалить
                </button>
                <button onClick={() => handleSettlementFromBooking(booking)}>
                  Поселение по брони
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Поселения</h2>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>ID</th>
            <th>Клиент</th>
            <th>Номер</th>
            <th>Дата поселения</th>
            <th>Дата освобождения</th>
            <th>Примечание</th>
            <th>Бронь</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {settlements.map((settlement) => (
            <tr key={settlement.id}>
              <td>{settlement.id}</td>
              <td>{getClientName(settlement.clients)}</td>
              <td>{settlement.rooms?.room_number}</td>
              <td>{settlement.check_in_date}</td>
              <td>{settlement.check_out_date}</td>
              <td>{settlement.note}</td>
              <td>{settlement.booking_id}</td>
              <td>
                <button onClick={() => handleEditSettlement(settlement)}>
                  Изменить
                </button>
                <button onClick={() => handleDeleteSettlement(settlement.id)}>
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Скидки клиентов</h2>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>ID</th>
            <th>Клиент</th>
            <th>Скидка</th>
            <th>Процент</th>
            <th>Дата начала</th>
            <th>Дата окончания</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {clientDiscounts.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{getClientName(item.clients)}</td>
              <td>{item.discounts?.name}</td>
              <td>{item.discounts?.discount_percent}</td>
              <td>{item.date_from}</td>
              <td>{item.date_to}</td>
              <td>
                <button onClick={() => handleDeleteClientDiscount(item.id)}>
                  Удалить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>
        {editingBookingId
          ? "Редактирование бронирования"
          : "Добавление бронирования"}
      </h2>
      <form onSubmit={handleBookingSubmit}>
        <div>
          <select
            name="client_id"
            value={bookingForm.client_id}
            onChange={handleBookingChange}
            required
          >
            <option value="">Выберите клиента</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {getClientName(client)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            name="room_id"
            value={bookingForm.room_id}
            onChange={handleBookingChange}
            required
          >
            <option value="">Выберите номер</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.room_number}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="date"
            name="planned_check_in"
            value={bookingForm.planned_check_in}
            onChange={handleBookingChange}
            required
          />
        </div>

        <div>
          <input
            type="date"
            name="planned_check_out"
            value={bookingForm.planned_check_out}
            onChange={handleBookingChange}
            required
          />
        </div>

        <div>
          <input
            name="note"
            value={bookingForm.note}
            onChange={handleBookingChange}
            placeholder="Примечание"
          />
        </div>

        <div>
          <button type="submit">
            {editingBookingId ? "Сохранить изменения" : "Добавить бронь"}
          </button>
          <button type="button" onClick={resetBookingForm}>
            Очистить
          </button>
        </div>
      </form>

      <h2>
        {editingSettlementId
          ? "Редактирование поселения"
          : "Добавление поселения"}
      </h2>
      <form onSubmit={handleSettlementSubmit}>
        <div>
          <select
            name="client_id"
            value={settlementForm.client_id}
            onChange={handleSettlementChange}
            required
          >
            <option value="">Выберите клиента</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {getClientName(client)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            name="room_id"
            value={settlementForm.room_id}
            onChange={handleSettlementChange}
            required
          >
            <option value="">Выберите номер</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.room_number}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="date"
            name="check_in_date"
            value={settlementForm.check_in_date}
            onChange={handleSettlementChange}
            required
          />
        </div>

        <div>
          <input
            type="date"
            name="check_out_date"
            value={settlementForm.check_out_date}
            onChange={handleSettlementChange}
            required
          />
        </div>

        <div>
          <input
            name="note"
            value={settlementForm.note}
            onChange={handleSettlementChange}
            placeholder="Примечание"
          />
        </div>

        <div>
          <button type="submit">
            {editingSettlementId ? "Сохранить изменения" : "Добавить поселение"}
          </button>
          <button type="button" onClick={resetSettlementForm}>
            Очистить
          </button>
        </div>
      </form>

      <h2>Назначение скидки клиенту</h2>
      <form onSubmit={handleClientDiscountSubmit}>
        <div>
          <select
            name="client_id"
            value={clientDiscountForm.client_id}
            onChange={handleClientDiscountChange}
            required
          >
            <option value="">Выберите клиента</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {getClientName(client)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            name="discount_id"
            value={clientDiscountForm.discount_id}
            onChange={handleClientDiscountChange}
            required
          >
            <option value="">Выберите скидку</option>
            {discounts.map((discount) => (
              <option key={discount.id} value={discount.id}>
                {discount.name} ({discount.discount_percent}%)
              </option>
            ))}
          </select>
        </div>

        <div>
          <button type="submit">Назначить скидку</button>
          <button type="button" onClick={resetClientDiscountForm}>
            Очистить
          </button>
        </div>
      </form>

      <div style={{ marginTop: "24px" }}>
        <Link to="/clients">
          <button>Клиенты</button>
        </Link>
        <Link to="/rooms">
          <button>Номера</button>
        </Link>
        <button onClick={handleLogout}>Выйти</button>
      </div>
    </div>
  );
}
