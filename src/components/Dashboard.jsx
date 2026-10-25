import StatCard from "./StatCard";
import { getById, formatDate, formatMinutes } from "../utils/helpers";

function Dashboard({ stats, races, tracks, drivers, cars, participants }) {
  const nextRace = races
    .filter((race) => race.status === "Scheduled")
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0];

  const lastRace = races
    .filter((race) => race.status === "Finished")
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))[0];

  const podium = lastRace
    ? participants
        .filter((p) => p.raceId === lastRace.id && p.finishPosition)
        .sort((a, b) => a.finishPosition - b.finishPosition)
        .slice(0, 3)
    : [];

  const nextTrack = nextRace ? getById(tracks, nextRace.trackId) : null;

  return (
    <section>
      <h2 className="page-title">Dashboard</h2>
      <div className="stat-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Race Berikutnya</h3>
          {nextRace ? (
            <div>
              <p className="highlight">{nextRace.name}</p>
              <p className="muted">
                {nextTrack ? nextTrack.name : "-"} · {formatDate(nextRace.date)} · {nextRace.time}
              </p>
              <p className="muted">Durasi rencana: {formatMinutes(nextRace.plannedDuration)}</p>
            </div>
          ) : (
            <p className="empty">Belum ada race terjadwal</p>
          )}
        </div>

        <div className="card">
          <h3>Podium Terakhir{lastRace ? ` - ${lastRace.name}` : ""}</h3>
          {podium.length === 0 ? (
            <p className="empty">Belum ada hasil race</p>
          ) : (
            <ol className="podium">
              {podium.map((p) => {
                const driver = getById(drivers, p.driverId);
                const car = getById(cars, p.carId);
                return (
                  <li key={p.id}>
                    <span className="podium-pos">P{p.finishPosition}</span>
                    <span>{driver ? driver.name : "-"}</span>
                    <span className="muted">{car ? car.name : "-"}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
