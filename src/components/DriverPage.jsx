import { useState } from "react";

const emptyForm = { name: "", country: "", number: "" };

function DriverPage({ drivers, onAdd, onUpdate, onDelete }) {
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
    const number = Number(form.number);

    if (!name || !country || !form.number) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (!Number.isInteger(number) || number < 1 || number > 999) {
      setError("Nomor balap harus bilangan bulat 1-999.");
      return;
    }
    if (drivers.some((d) => d.number === number && d.id !== editingId)) {
      setError("Nomor balap sudah dipakai driver lain.");
      return;
    }

    const data = { name, country, number };
    if (editingId) {
      onUpdate(editingId, data);
    } else {
      onAdd(data);
    }
    resetForm();
  }

  function handleEdit(driver) {
    setEditingId(driver.id);
    setForm({ name: driver.name, country: driver.country, number: String(driver.number) });
    setError("");
  }

  function handleDelete(driver) {
    if (window.confirm(`Hapus driver ${driver.name}?`)) {
      onDelete(driver.id);
      if (editingId === driver.id) {
        resetForm();
      }
    }
  }

  return (
    <section>
      <h2 className="page-title">Driver</h2>

      <form className="card" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Driver" : "Tambah Driver"}</h3>
        <div className="form-grid">
          <label>
            Nama Driver
            <input name="name" value={form.name} onChange={handleChange} placeholder="Contoh: Rafi Pratama" />
          </label>
          <label>
            Negara
            <input name="country" value={form.country} onChange={handleChange} placeholder="Contoh: Indonesia" />
          </label>
          <label>
            Nomor Balap
            <input name="number" type="number" value={form.number} onChange={handleChange} placeholder="Contoh: 7" />
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
        <h3>Daftar Driver ({drivers.length})</h3>
        {drivers.length === 0 ? (
          <p className="empty">Belum ada data driver</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Nama</th>
                  <th>Negara</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td>#{driver.number}</td>
                    <td>{driver.name}</td>
                    <td>{driver.country}</td>
                    <td>
                      <div className="cell-actions">
                        <button className="btn btn-small" onClick={() => handleEdit(driver)}>Edit</button>
                        <button className="btn btn-small btn-danger" onClick={() => handleDelete(driver)}>Hapus</button>
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

export default DriverPage;
