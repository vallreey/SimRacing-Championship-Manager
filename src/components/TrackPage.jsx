import { useState } from "react";
import DetailModal from "./DetailModal";

const emptyForm = { name: "", country: "", length: "", image: "" };
const maxImageSize = 5 * 1024 * 1024;

function TrackPage({ tracks, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(null);

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

    const data = { name, country, length, image: form.image };
    if (editingId) {
      onUpdate(editingId, data);
    } else {
      onAdd(data);
    }
    resetForm();
  }

  function handleEdit(track) {
    setEditingId(track.id);
    setForm({
      name: track.name,
      country: track.country,
      length: String(track.length),
      image: track.image || "",
    });
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
      <div className="page-heading">
        <div>
          <h2 className="page-title">Sirkuit</h2>
          <p className="page-description">Kelola sirkuit balap, detail lintasan, dan gambar.</p>
        </div>
        <span className="section-count">{tracks.length} SIRKUIT</span>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <h3 className="card-heading">{editingId ? "Edit Sirkuit" : "Tambah Sirkuit"}</h3>
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
          <label className="image-field">
            Gambar Sirkuit <span className="optional-label">OPSIONAL · MAKS. 5 MB</span>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>
        </div>
        {form.image && (
          <div className="car-image-preview">
            <img src={form.image} alt="Pratinjau gambar sirkuit" />
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
          <h3 className="card-heading">Koleksi Sirkuit</h3>
          <span className="muted">{tracks.length} terdaftar</span>
        </div>
        {tracks.length === 0 ? (
          <div className="card">
            <p className="empty">Belum ada data sirkuit</p>
          </div>
        ) : (
          <div className="car-grid">
            {tracks.map((track) => (
              <article className="car-card track-card" key={track.id}>
                <button
                  type="button"
                  className="car-card-detail-trigger"
                  onClick={() => setSelectedTrack(track)}
                  aria-label={`Lihat detail ${track.name}`}
                >
                  <div className="car-card-image track-card-image">
                    {track.image ? (
                      <img src={track.image} alt={track.name} />
                    ) : (
                      <div className="car-image-placeholder" aria-label="Gambar sirkuit belum ditambahkan">
                        <span>CIRCUIT</span>
                        <strong>{track.country}</strong>
                      </div>
                    )}
                    <span className="car-class-badge">{track.country}</span>
                  </div>
                  <div className="car-card-content">
                    <p className="car-manufacturer">LINTASAN BALAP</p>
                    <h4>{track.name}</h4>
                    <p className="track-length">{Number(track.length).toFixed(3)} km</p>
                  </div>
                </button>
                <div className="car-card-actions">
                  <button className="btn btn-small" onClick={() => handleEdit(track)}>Edit</button>
                  <button className="btn btn-small btn-danger" onClick={() => handleDelete(track)}>Hapus</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      {selectedTrack && (
        <DetailModal
          title={selectedTrack.name}
          subtitle="Sirkuit"
          image={selectedTrack.image}
          imageAlt={selectedTrack.name}
          imageFit="contain"
          details={[
            { label: "Negara", value: selectedTrack.country },
            { label: "Panjang", value: `${Number(selectedTrack.length).toFixed(3)} km` },
          ]}
          onClose={() => setSelectedTrack(null)}
        />
      )}
    </section>
  );
}

export default TrackPage;
