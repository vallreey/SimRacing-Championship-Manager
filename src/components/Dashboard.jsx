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
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-description">Ringkasan kejuaraan dan aktivitas race.</p>
      </div>

      <div className="stat-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="card dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <p className="dashboard-eyebrow">AGENDA</p>
              <h3>Race Berikutnya</h3>
            </div>
            {nextRace && <span className="dashboard-status">TERJADWAL</span>}
          </div>
          {nextRace ? (
            <div className="next-race-details">
              <p className="highlight">{nextRace.name}</p>
              <p className="next-race-track">{nextTrack ? nextTrack.name : "Sirkuit belum dipilih"}</p>
              <div className="race-meta">
                <div>
                  <span>TANGGAL</span>
                  <strong>{formatDate(nextRace.date)}</strong>
                </div>
                <div>
                  <span>WAKTU</span>
                  <strong>{nextRace.time}</strong>
                </div>
                <div>
                  <span>DURASI</span>
                  <strong>{formatMinutes(nextRace.plannedDuration)}</strong>
                </div>
              </div>
            </div>
          ) : (
            <p className="empty">Belum ada race terjadwal</p>
          )}
        </article>

        <article className="card dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <p className="dashboard-eyebrow">HASIL TERBARU</p>
              <h3>Podium Terakhir</h3>
            </div>
            {lastRace && <span className="dashboard-race-name">{lastRace.name}</span>}
          </div>
          {podium.length === 0 ? (
            <p className="empty">Belum ada hasil race</p>
          ) : (
            <ol className="podium dashboard-podium">
              {podium.map((p) => {
                const driver = getById(drivers, p.driverId);
                const car = getById(cars, p.carId);
                return (
                  <li key={p.id}>
                    <span className={`podium-pos podium-pos-${p.finishPosition}`}>P{p.finishPosition}</span>
                    <span className="podium-driver">
                      <strong>{driver ? driver.name : "Driver tidak ditemukan"}</strong>
                      <span>{car ? car.name : "Mobil tidak ditemukan"}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </article>
      </div>
    </section>
  );
}

export default Dashboard;
