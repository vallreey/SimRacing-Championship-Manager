import { useState } from "react";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import PlaceholderPage from "./components/PlaceholderPage";
import DriverPage from "./components/DriverPage";
import CarPage from "./components/CarPage";
import TrackPage from "./components/TrackPage";
import RacePage from "./components/RacePage";
import { initialDrivers, initialCars, initialTracks, initialRaces } from "./data/initialData";
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
  const [tracks, setTracks] = useState(initialTracks);
  const [races, setRaces] = useState(initialRaces);

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

  function handleAddTrack(data) {
    setTracks([...tracks, { id: createId("trk"), ...data }]);
  }

  function handleUpdateTrack(id, data) {
    setTracks(tracks.map((track) => (track.id === id ? { ...track, ...data } : track)));
  }

  function handleDeleteTrack(id) {
    if (races.some((race) => race.trackId === id)) {
      window.alert("Sirkuit tidak dapat dihapus karena dipakai di jadwal race.");
      return;
    }
    setTracks(tracks.filter((track) => track.id !== id));
  }

  function handleAddRace(data) {
    setRaces([
      ...races,
      { id: createId("race"), ...data, startTime: null, endTime: null, actualDuration: null },
    ]);
  }

  function handleUpdateRace(id, data) {
    setRaces(races.map((race) => (race.id === id ? { ...race, ...data } : race)));
  }

  function handleDeleteRace(id) {
    setRaces(races.filter((race) => race.id !== id));
  }

  const stats = [
    { label: "Driver", value: drivers.length },
    { label: "Mobil", value: cars.length },
    { label: "Sirkuit", value: tracks.length },
    { label: "Race", value: races.length },
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
        {activePage === "tracks" && <TrackPage tracks={tracks} onAdd={handleAddTrack} onUpdate={handleUpdateTrack} onDelete={handleDeleteTrack} />}
        {activePage === "races" && <RacePage races={races} tracks={tracks} onAdd={handleAddRace} onUpdate={handleUpdateRace} onDelete={handleDeleteRace} />}
        {activePage === "participants" && <PlaceholderPage title="Peserta & Grid"/>}
        {activePage === "control" && <PlaceholderPage title="Start & Finish" />}
        {activePage === "results" && <PlaceholderPage title="Hasil Race"/>}
      </main>
    </div>
  );
}

export default App;
