import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { getById, formatMinutes, formatDate } from "../utils/helpers";

const emptyForm = {
  name: "",
  trackId: "",
  date: "",
  time: "",
  plannedDuration: "",
  status: "Scheduled",
};

function RacePage({ races, tracks, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const statusLocked = form.status === "In Progress" || form.status === "Finished";
  const statusOptions = statusLocked ? [form.status] : ["Scheduled", "Cancelled"];

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    const plannedDuration = Number(form.plannedDuration);

    if (!name || !form.trackId || !form.date || !form.time || !form.plannedDuration) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (!Number.isInteger(plannedDuration) || plannedDuration < 1 || plannedDuration > 1440) {
      setError("Durasi rencana harus bilangan bulat 1-1440 menit.");
      return;
    }
    if (races.some((r) => r.name.toLowerCase() === name.toLowerCase() && r.id !== editingId)) {
      setError("Nama race sudah dipakai.");
      return;
    }

    const data = {
      name,
      trackId: form.trackId,
      date: form.date,
      time: form.time,
      plannedDuration,
      status: form.status,
    };
    if (editingId) {
      onUpdate(editingId, data);
    } else {
      onAdd(data);
    }
    resetForm();
  }

  function handleEdit(race) {
    setEditingId(race.id);
    setForm({
      name: race.name,
      trackId: race.trackId,
      date: race.date,
      time: race.time,
      plannedDuration: String(race.plannedDuration),
      status: race.status,
    });
    setError("");
  }

  function handleDelete(race) {
    if (window.confirm(`Hapus race ${race.name}?`)) {
      onDelete(race.id);
      if (editingId === race.id) {
        resetForm();
      }
    }
  }

  return (
    <section>
      <h2 className="page-title">Jadwal Race</h2>

      <form className="card" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Race" : "Tambah Race"}</h3>
        {tracks.length === 0 && (
          <p className="note">Belum ada sirkuit. Tambahkan sirkuit terlebih dahulu.</p>
        )}
        <div className="form-grid">
          <label>
            Nama Race
            <input name="name" value={form.name} onChange={handleChange} placeholder="Contoh: Round 3 - Silverstone" />
          </label>
          <label>
            Sirkuit
            <select name="trackId" value={form.trackId} onChange={handleChange}>
              <option value="">Pilih sirkuit</option>
              {tracks.map((track) => (
                <option key={track.id} value={track.id}>{track.name}</option>
              ))}
            </select>
          </label>
          <label>
            Tanggal
            <input name="date" type="date" value={form.date} onChange={handleChange} />
          </label>
          <label>
            Waktu
            <input name="time" type="time" value={form.time} onChange={handleChange} />
          </label>
          <label>
            Durasi Rencana (menit)
            <input name="plannedDuration" type="number" value={form.plannedDuration} onChange={handleChange} placeholder="Contoh: 90" />
          </label>
          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange} disabled={statusLocked}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingId ? "Simpan Perubahan" : "Tambah"}
          </button>
          {editingId && (
            <button type="button" className="btn" onClick={resetForm}>
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="card">
        <h3>Daftar Race ({races.length})</h3>
        {races.length === 0 ? (
          <p className="empty">Belum ada data race</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Race</th>
                  <th>Sirkuit</th>
                  <th>Tanggal</th>
                  <th>Waktu</th>
                  <th>Durasi Rencana</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {races.map((race) => {
                  const track = getById(tracks, race.trackId);
                  return (
                    <tr key={race.id}>
                      <td>{race.name}</td>
                      <td>{track ? track.name : "-"}</td>
                      <td>{formatDate(race.date)}</td>
                      <td>{race.time}</td>
                      <td>{formatMinutes(race.plannedDuration)}</td>
                      <td><StatusBadge status={race.status} /></td>
                      <td>
                        <div className="cell-actions">
                          <button className="btn btn-small" onClick={() => handleEdit(race)}>Edit</button>
                          <button className="btn btn-small btn-danger" onClick={() => handleDelete(race)}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default RacePage;
