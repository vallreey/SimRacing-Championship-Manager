import StatCard from "./StatCard";

function Dashboard({ stats }) {
  return (
    <section>
      <h2 className="page-title">Dashboard</h2>
      <div className="stat-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
    </section>
  );
}

export default Dashboard;
