import { useState } from "react";
import { CAR_CLASSES } from "../utils/helpers";
import DetailModal from "./DetailModal";

const emptyForm = { name: "", manufacturer: "", carClass: "", image: "" };
const maxImageSize = 5 * 1024 * 1024;

function CarPage({ cars, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      e.target.value = "";
      return;
    }
    if (file.size > maxImageSize) {
      setError("Ukuran gambar maksimal 5 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setError("Gambar tidak dapat dibaca.");
        return;
      }
      setForm((currentForm) => ({ ...currentForm, image: reader.result }));
      setError("");
    };
    reader.onerror = () => setError("Gagal membaca gambar. Silakan coba file lain.");
    reader.readAsDataURL(file);
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

    const data = { name, manufacturer, carClass: form.carClass, image: form.image };
    if (editingId) {
      onUpdate(editingId, data);
    } else {
      onAdd(data);
    }
    resetForm();
  }

  function handleEdit(car) {
    setEditingId(car.id);
    setForm({
      name: car.name,
      manufacturer: car.manufacturer,
      carClass: car.carClass,
      image: car.image || "",
    });
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
      <div className="page-heading">
        <div>
          <h2 className="page-title">Garasi Mobil</h2>
          <p className="page-description">Kelola koleksi mobil balap dan tampilkan gambar setiap mobil.</p>
        </div>
        <span className="section-count">{cars.length} MOBIL</span>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <h3 className="card-heading">{editingId ? "Edit Mobil" : "Tambah Mobil"}</h3>
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
          <label className="image-field">
            Gambar Mobil <span className="optional-label">OPSIONAL · MAKS. 5 MB</span>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>
        </div>
        {form.image && (
          <div className="car-image-preview">
            <img src={form.image} alt="Pratinjau gambar mobil" />
            <button
              type="button"
              className="btn btn-small"
              onClick={() => setForm((currentForm) => ({ ...currentForm, image: "" }))}
            >
              Hapus gambar
            </button>
          </div>
        )}
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

      <div className="garage-section">
        <div className="garage-heading">
          <h3 className="card-heading">Koleksi Mobil</h3>
          <span className="muted">{cars.length} terdaftar</span>
        </div>
        {cars.length === 0 ? (
          <div className="card">
            <p className="empty">Belum ada data mobil</p>
          </div>
        ) : (
          <div className="car-grid">
            {cars.map((car) => (
              <article className="car-card" key={car.id}>
                <button
                  type="button"
                  className="car-card-detail-trigger"
                  onClick={() => setSelectedCar(car)}
                  aria-label={`Lihat detail ${car.name}`}
                >
                  <div className="car-card-image">
                    {car.image ? (
                      <img src={car.image} alt={car.name} />
                    ) : (
                      <div className="car-image-placeholder" aria-label="Gambar mobil belum ditambahkan">
                        <span>{car.carClass || "RACE"}</span>
                        <strong>{car.manufacturer}</strong>
                      </div>
                    )}
                    <span className="car-class-badge">{car.carClass}</span>
                  </div>
                  <div className="car-card-content">
                    <p className="car-manufacturer">{car.manufacturer}</p>
                    <h4>{car.name}</h4>
                  </div>
                </button>
                <div className="car-card-actions">
                  <button className="btn btn-small" onClick={() => handleEdit(car)}>Edit</button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(car)}>Hapus</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      {selectedCar && (
        <DetailModal
          title={selectedCar.name}
          subtitle={selectedCar.manufacturer}
          image={selectedCar.image}
          imageAlt={selectedCar.name}
          details={[
            { label: "Manufacturer", value: selectedCar.manufacturer },
            { label: "Kelas", value: selectedCar.carClass },
          ]}
          onClose={() => setSelectedCar(null)}
        />
      )}
    </section>
  );
}

export default CarPage;
