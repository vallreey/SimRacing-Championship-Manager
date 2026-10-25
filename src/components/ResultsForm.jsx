import { useState } from "react";
import { getById } from "../utils/helpers";

function ResultsForm({ participants, drivers, cars, onSave }) {
  const [positions, setPositions] = useState(() => {
    const initial = {};
    participants.forEach((p) => {
      initial[p.id] = p.finishPosition ? String(p.finishPosition) : "";
    });
    return initial;
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function handleChange(id, value) {
    setPositions({ ...positions, [id]: value });
    setMessage("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    const total = participants.length;
    const values = participants.map((p) => Number(positions[p.id]));
    setMessage("");

    if (participants.some((p) => positions[p.id] === "")) {
      setError("Semua posisi finish wajib diisi.");
      return;
    }
    if (values.some((value) => !Number.isInteger(value) || value < 1 || value > total)) {
      setError(`Posisi finish harus bilangan bulat 1-${total}.`);
      return;
    }
    if (new Set(values).size !== total) {
      setError("Posisi finish tidak boleh sama.");
      return;
    }

    const result = {};
    participants.forEach((p) => {
      result[p.id] = Number(positions[p.id]);
    });
    onSave(result);
    setError("");
    setMessage("Hasil race berhasil disimpan.");
  }

  if (participants.length === 0) {
    return (
      <div className="card">
        <p className="empty">Race ini belum memiliki peserta</p>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>Input / Edit Posisi Finish</h3>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Grid</th>
              <th>Driver</th>
              <th>Mobil</th>
              <th>Posisi Finish</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => {
              const driver = getById(drivers, p.driverId);
              const car = getById(cars, p.carId);
              return (
                <tr key={p.id}>
                  <td>P{p.gridPosition}</td>
                  <td>{driver ? `#${driver.number} ${driver.name}` : "-"}</td>
                  <td>{car ? car.name : "-"}</td>
                  <td>
                    <input
                      className="position-input"
                      type="number"
                      value={positions[p.id]}
                      onChange={(e) => handleChange(p.id, e.target.value)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Simpan Hasil</button>
      </div>
    </form>
  );
}

export default ResultsForm;
