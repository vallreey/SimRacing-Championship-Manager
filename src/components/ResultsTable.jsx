import { getById } from "../utils/helpers";

function ResultsTable({ participants, drivers, cars }) {
  const ranked = participants
    .filter((p) => p.finishPosition)
    .sort((a, b) => a.finishPosition - b.finishPosition);

  return (
    <div className="card">
      <h3>Hasil Akhir</h3>
      {ranked.length === 0 ? (
        <p className="empty">Belum ada hasil untuk race ini</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Posisi</th>
                <th>Driver</th>
                <th>Mobil</th>
                <th>Grid</th>
                <th>+/-</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((p) => {
                const driver = getById(drivers, p.driverId);
                const car = getById(cars, p.carId);
                const gain = p.gridPosition - p.finishPosition;
                let gainClass = "";
                if (gain > 0) gainClass = "gain-up";
                if (gain < 0) gainClass = "gain-down";
                return (
                  <tr key={p.id}>
                    <td><strong>P{p.finishPosition}</strong></td>
                    <td>{driver ? `#${driver.number} ${driver.name}` : "-"}</td>
                    <td>{car ? car.name : "-"}</td>
                    <td>P{p.gridPosition}</td>
                    <td className={gainClass}>{gain > 0 ? `+${gain}` : gain}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ResultsTable;
