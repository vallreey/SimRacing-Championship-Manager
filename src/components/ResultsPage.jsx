import { useState } from "react";
import ResultsForm from "./ResultsForm";
import ResultsTable from "./ResultsTable";
import { getById } from "../utils/helpers";

function ResultsPage({ races, drivers, cars, participants, onSaveResults }) {
  const finishedRaces = races.filter((race) => race.status === "Finished");
  const [selectedRaceId, setSelectedRaceId] = useState(
    finishedRaces.length > 0 ? finishedRaces[0].id : ""
  );

  const race = getById(races, selectedRaceId);
  const raceParticipants = participants
    .filter((p) => p.raceId === selectedRaceId)
    .sort((a, b) => a.gridPosition - b.gridPosition);

  if (finishedRaces.length === 0) {
    return (
      <section>
        <h2 className="page-title">Hasil Race</h2>
        <div className="card">
          <p className="empty">Belum ada race yang selesai</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="page-title">Hasil Race</h2>

      <div className="card">
        <label className="select-row">
          Pilih Race (Finished)
          <select value={selectedRaceId} onChange={(e) => setSelectedRaceId(e.target.value)}>
            {finishedRaces.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        {race && race.actualDuration && (
          <p className="muted">Durasi aktual: {race.actualDuration} (HH:MM)</p>
        )}
      </div>

      <ResultsForm
        key={selectedRaceId}
        participants={raceParticipants}
        drivers={drivers}
        cars={cars}
        onSave={(positions) => onSaveResults(selectedRaceId, positions)}
      />

      <ResultsTable participants={raceParticipants} drivers={drivers} cars={cars} />
    </section>
  );
}

export default ResultsPage;
