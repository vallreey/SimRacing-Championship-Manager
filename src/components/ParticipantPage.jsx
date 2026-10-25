import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { getById } from "../utils/helpers";

const emptyForm = { driverId: "", carId: "", gridPosition: "" };

function ParticipantPage({ races, drivers, cars, participants, onAdd, onUpdate, onDelete }) {
  const [selectedRaceId, setSelectedRaceId] = useState(races.length > 0 ? races[0].id : "");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const race = getById(races, selectedRaceId);
  const locked = race ? race.status === "In Progress" || race.status === "Finished" : false;
  const raceParticipants = participants
    .filter((p) => p.raceId === selectedRaceId)
    .sort((a, b) => a.gridPosition - b.gridPosition);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  }

  function handleSelectRace(e) {
    setSelectedRaceId(e.target.value);
    resetForm();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const gridPosition = Number(form.gridPosition);

    if (!form.driverId || !form.carId || !form.gridPosition) {
      setError("Driver, mobil, dan starting grid wajib diisi.");
      return;
    }
    if (!Number.isInteger(gridPosition) || gridPosition < 1 || gridPosition > 40) {
      setError("Starting grid harus bilangan bulat 1-40.");
      return;
    }

    const others = raceParticipants.filter((p) => p.id !== editingId);
    if (others.some((p) => p.driverId === form.driverId)) {
      setError("Driver ini sudah terdaftar di race yang sama.");
      return;
    }
    if (others.some((p) => p.gridPosition === gridPosition)) {
      setError(`Starting grid ${gridPosition} sudah dipakai peserta lain.`);
      return;
    }

    const data = { raceId: selectedRaceId, driverId: form.driverId, carId: form.carId, gridPosition };
    if (editingId) {
      onUpdate(editingId, data);
    } else {
      onAdd(data);
    }
    resetForm();
  }

  function handleEdit(participant) {
    setEditingId(participant.id);
    setForm({
      driverId: participant.driverId,
      carId: participant.carId,
      gridPosition: String(participant.gridPosition),
    });
    setError("");
  }

  function handleDelete(participant) {
    if (window.confirm("Hapus peserta ini dari race?")) {
      onDelete(participant.id);
      if (editingId === participant.id) {
        resetForm();
      }
    }
  }

  if (races.length === 0) {
    return (
      <section>
        <h2 className="page-title">Peserta & Starting Grid</h2>
        <div className="card">
          <p className="empty">Belum ada data race. Buat jadwal race terlebih dahulu.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="page-title">Peserta & Starting Grid</h2>

      <div className="card">
        <label className="select-row">
          Pilih Race
          <select value={selectedRaceId} onChange={handleSelectRace}>
            {races.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        {race && <StatusBadge status={race.status} />}
      </div>

      {locked ? (
        <div className="card">
          <p className="note">Peserta tidak dapat diubah setelah race dimulai.</p>
        </div>
      ) : (
        <form className="card" onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit Peserta" : "Tambah Peserta"}</h3>
          <div className="form-grid">
            <label>
              Driver
              <select name="driverId" value={form.driverId} onChange={handleChange}>
                <option value="">Pilih driver</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    #{driver.number} {driver.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Mobil
              <select name="carId" value={form.carId} onChange={handleChange}>
                <option value="">Pilih mobil</option>
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.name} ({car.carClass})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Starting Grid
              <input name="gridPosition" type="number" value={form.gridPosition} onChange={handleChange} placeholder="Contoh: 1" />
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
      )}

      <div className="card">
        <h3>Starting Grid ({raceParticipants.length} peserta)</h3>
        {raceParticipants.length === 0 ? (
          <p className="empty">Belum ada data peserta</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Grid</th>
                  <th>Driver</th>
                  <th>Mobil</th>
                  {!locked && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {raceParticipants.map((p) => {
                  const driver = getById(drivers, p.driverId);
                  const car = getById(cars, p.carId);
                  return (
                    <tr key={p.id}>
                      <td>P{p.gridPosition}</td>
                      <td>{driver ? `#${driver.number} ${driver.name}` : "-"}</td>
                      <td>{car ? car.name : "-"}</td>
                      {!locked && (
                        <td>
                          <div className="cell-actions">
                            <button className="btn btn-small" onClick={() => handleEdit(p)}>Edit</button>
                            <button className="btn btn-small btn-danger" onClick={() => handleDelete(p)}>Hapus</button>
                          </div>
                        </td>
                      )}
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

export default ParticipantPage;
