import { useState } from "react";

const emptyForm = { name: "", country: "", length: "" };

function TrackPage({ tracks, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

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
    const country = form.country.trim();
    const length = Number(form.length);

    if (!name || !country || !form.length) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (Number.isNaN(length) || length <= 0 || length > 50) {
      setError("Panjang sirkuit harus lebih dari 0 dan maksimal 50 km.");
      return;
    }
    if (tracks.some((t) => t.name.toLowerCase() === name.toLowerCase() && t.id !== editingId)) {
      setError("Nama sirkuit sudah terdaftar.");
      return;
    }

    const data = { name, country, length };
    if (editingId) {
      onUpdate(editingId, data);
    } else {
      onAdd(data);
    }
    resetForm();
  }

  function handleEdit(track) {
    setEditingId(track.id);
    setForm({ name: track.name, country: track.country, length: String(track.length) });
    setError("");
  }

  function handleDelete(track) {
    if (window.confirm(`Hapus sirkuit ${track.name}?`)) {
      onDelete(track.id);
      if (editingId === track.id) {
        resetForm();
      }
    }
  }

  return (
    <section>
      <h2 className="page-title">Sirkuit</h2>

      <form className="card" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Sirkuit" : "Tambah Sirkuit"}</h3>
        <div className="form-grid">
          <label>
            Nama Sirkuit
            <input name="name" value={form.name} onChange={handleChange} placeholder="Contoh: Autodromo di Monza" />
          </label>
          <label>
            Negara
            <input name="country" value={form.country} onChange={handleChange} placeholder="Contoh: Italia" />
          </label>
          <label>
            Panjang (km)
            <input name="length" type="number" step="0.001" value={form.length} onChange={handleChange} placeholder="Contoh: 5.793" />
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
        <h3>Daftar Sirkuit ({tracks.length})</h3>
        {tracks.length === 0 ? (
          <p className="empty">Belum ada data sirkuit</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama Sirkuit</th>
                  <th>Negara</th>
                  <th>Panjang</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((track) => (
                  <tr key={track.id}>
                    <td>{track.name}</td>
                    <td>{track.country}</td>
                    <td>{track.length} km</td>
                    <td>
                      <div className="cell-actions">
                        <button className="btn btn-small" onClick={() => handleEdit(track)}>Edit</button>
                        <button className="btn btn-small btn-danger" onClick={() => handleDelete(track)}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default TrackPage;
