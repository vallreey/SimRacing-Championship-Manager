import { useState } from "react";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import PlaceholderPage from "./components/PlaceholderPage";

const navItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "drivers", label: "Driver" },
  { key: "cars", label: "Mobil" },
  { key: "tracks", label: "Sirkuit" },
  { key: "races", label: "Jadwal Race" },
  { key: "participants", label: "Peserta & Grid" },
  { key: "control", label: "Start & Finish" },
  { key: "results", label: "Hasil Race" },
];

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const stats = [
    { label: "Driver", value: 0 },
    { label: "Mobil", value: 0 },
    { label: "Sirkuit", value: 0 },
    { label: "Race", value: 0 },
    { label: "Peserta", value: 0 },
  ];

  return (
    <div className="app">
      <Header />
      <Navbar items={navItems} activePage={activePage} onNavigate={setActivePage} />
      <main className="main">
        {activePage === "dashboard" && <Dashboard stats={stats} />}
        {activePage === "drivers" && <PlaceholderPage title="Driver"/>}
        {activePage === "cars" && <PlaceholderPage title="Mobil" />}
        {activePage === "tracks" && <PlaceholderPage title="Sirkuit"/>}
        {activePage === "races" && <PlaceholderPage title="Jadwal Race" />}
        {activePage === "participants" && <PlaceholderPage title="Peserta & Grid" />}
        {activePage === "control" && <PlaceholderPage title="Start & Finish" />}
        {activePage === "results" && <PlaceholderPage title="Hasil Race" />}
      </main>
    </div>
  );
}

export default App;
