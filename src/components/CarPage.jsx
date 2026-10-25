import { useState } from "react";
import { CAR_CLASSES } from "../utils/helpers";

const emptyForm = { name: "", manufacturer: "", carClass: "" };

function CarPage({ cars, onAdd, onUpdate, onDelete }) {
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
    const manufacturer = form.manufacturer.trim();

    if (!name || !manufacturer || !form.carClass) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (cars.some((c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== editingId)) {
      setError("Nama mobil sudah terdaftar.");
      return;
    }

    const data = { name, manufacturer, carClass: form.carClass };
    if (editingId) {
      onUpdate(editingId, data);
    } else {
      onAdd(data);
    }
    resetForm();
  }

  function handleEdit(car) {
    setEditingId(car.id);
    setForm({ name: car.name, manufacturer: car.manufacturer, carClass: car.carClass });
    setError("");
  }

  function handleDelete(car) {
    if (window.confirm(`Hapus mobil ${car.name}?`)) {
      onDelete(car.id);
      if (editingId === car.id) {
        resetForm();
      }
    }
  }

  return (
    <section>
      <h2 className="page-title">Mobil</h2>

      <form className="card" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Mobil" : "Tambah Mobil"}</h3>
        <div className="form-grid">
          <label>
            Nama Mobil
            <input name="name" value={form.name} onChange={handleChange} placeholder="Contoh: Porsche 911 GT3 R" />
          </label>
          <label>
            Manufacturer
            <input name="manufacturer" value={form.manufacturer} onChange={handleChange} placeholder="Contoh: Porsche" />
          </label>
          <label>
            Kelas
            <select name="carClass" value={form.carClass} onChange={handleChange}>
              <option value="">Pilih kelas</option>
              {CAR_CLASSES.map((carClass) => (
                <option key={carClass} value={carClass}>{carClass}</option>
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
        <h3>Daftar Mobil ({cars.length})</h3>
        {cars.length === 0 ? (
          <p className="empty">Belum ada data mobil</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama Mobil</th>
                  <th>Manufacturer</th>
                  <th>Kelas</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car.id}>
                    <td>{car.name}</td>
                    <td>{car.manufacturer}</td>
                    <td>{car.carClass}</td>
                    <td>
                      <div className="cell-actions">
                        <button className="btn btn-small" onClick={() => handleEdit(car)}>Edit</button>
                        <button className="btn btn-small btn-danger" onClick={() => handleDelete(car)}>Hapus</button>
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

export default CarPage;
