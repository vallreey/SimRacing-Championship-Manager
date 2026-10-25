import RaceTimer from "./RaceTimer";
import StatusBadge from "./StatusBadge";
import { getById, formatMinutes, formatDate, formatDateTime } from "../utils/helpers";

function RaceControl({ races, tracks, participants, onStart, onFinish }) {
  return (
    <section>
      <h2 className="page-title">Start & Finish Race</h2>

      {races.length === 0 ? (
        <div className="card">
          <p className="empty">Belum ada data race</p>
        </div>
      ) : (
        <div className="race-grid">
          {races.map((race) => {
            const track = getById(tracks, race.trackId);
            const participantCount = participants.filter((p) => p.raceId === race.id).length;

            return (
              <div className="card race-card" key={race.id}>
                <div className="race-card-head">
                  <div>
                    <h3>{race.name}</h3>
                    <p className="muted">
                      {track ? track.name : "-"} · {formatDate(race.date)} · {race.time}
                    </p>
                  </div>
                  <StatusBadge status={race.status} />
                </div>

                <p className="muted">
                  Peserta: {participantCount} · Durasi rencana: {formatMinutes(race.plannedDuration)}
                </p>

                {race.status === "Scheduled" && (
                  <div className="race-actions">
                    <button
                      className="btn btn-primary"
                      disabled={participantCount < 2}
                      onClick={() => onStart(race.id)}
                    >
                      Start Race
                    </button>
                    {participantCount < 2 && (
                      <span className="hint">Minimal 2 peserta untuk memulai race</span>
                    )}
                  </div>
                )}

                {race.status === "In Progress" && (
                  <div>
                    <p className="muted">Mulai: {formatDateTime(race.startTime)}</p>
                    <RaceTimer startTime={race.startTime} />
                    <button className="btn btn-primary" onClick={() => onFinish(race.id)}>
                      Finish Race
                    </button>
                  </div>
                )}

                {race.status === "Finished" && (
                  <div className="race-info">
                    <p>Mulai: {formatDateTime(race.startTime)}</p>
                    <p>Selesai: {formatDateTime(race.endTime)}</p>
                    <p>
                      Durasi aktual: <strong>{race.actualDuration}</strong> (HH:MM)
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default RaceControl;
