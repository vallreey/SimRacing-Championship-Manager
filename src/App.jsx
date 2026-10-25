import { useState } from "react";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import PlaceholderPage from "./components/PlaceholderPage";
import DriverPage from "./components/DriverPage";
import CarPage from "./components/CarPage";
import { initialDrivers, initialCars } from "./data/initialData";
import { createId } from "./utils/helpers";

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
  const [drivers, setDrivers] = useState(initialDrivers);
  const [cars, setCars] = useState(initialCars);

  function handleAddDriver(data) {
    setDrivers([...drivers, { id: createId("drv"), ...data }]);
  }

  function handleUpdateDriver(id, data) {
    setDrivers(drivers.map((driver) => (driver.id === id ? { ...driver, ...data } : driver)));
  }

  function handleDeleteDriver(id) {
    setDrivers(drivers.filter((driver) => driver.id !== id));
  }

  function handleAddCar(data) {
    setCars([...cars, { id: createId("car"), ...data }]);
  }

  function handleUpdateCar(id, data) {
    setCars(cars.map((car) => (car.id === id ? { ...car, ...data } : car)));
  }

  function handleDeleteCar(id) {
    setCars(cars.filter((car) => car.id !== id));
  }

  const stats = [
    { label: "Driver", value: drivers.length },
    { label: "Mobil", value: cars.length },
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
        {activePage === "drivers" && <DriverPage drivers={drivers} onAdd={handleAddDriver} onUpdate={handleUpdateDriver} onDelete={handleDeleteDriver} />}
        {activePage === "cars" && <CarPage cars={cars} onAdd={handleAddCar} onUpdate={handleUpdateCar} onDelete={handleDeleteCar} />}
        {activePage === "tracks" && <PlaceholderPage title="Sirkuit" />}
        {activePage === "races" && <PlaceholderPage title="Jadwal Race" />}
        {activePage === "participants" && <PlaceholderPage title="Peserta & Grid" />}
        {activePage === "control" && <PlaceholderPage title="Start & Finish" />}
        {activePage === "results" && <PlaceholderPage title="Hasil Race" />}
      </main>
    </div>
  );
}

export default App;
