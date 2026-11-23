import { useEffect, useState } from "react";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import DriverPage from "./components/DriverPage";
import CarPage from "./components/CarPage";
import TrackPage from "./components/TrackPage";
import RacePage from "./components/RacePage";
import ParticipantPage from "./components/ParticipantPage";
import RaceControl from "./components/RaceControl";
import ResultsPage from "./components/ResultsPage";
import { initialDrivers, initialCars, initialTracks, initialParticipants } from "./data/initialData";
import { createId, getById, formatDuration } from "./utils/helpers";
import { createRace, deleteRace, getRaces, updateRace } from "./services/racesApi";

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
  const [races, setRaces] = useState([]);
  const [racesLoading, setRacesLoading] = useState(true);
  const [racesError, setRacesError] = useState("");
  const [participants, setParticipants] = useState(initialParticipants);

  useEffect(() => {
    let active = true;
    getRaces()
      .then((data) => {
        if (active) {
          setRaces(data);
          setRacesError("");
        }
      })
      .catch((error) => {
        if (active) {
          setRacesError(error.message);
        }
      })
      .finally(() => {
        if (active) {
          setRacesLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleReloadRaces() {
    setRacesLoading(true);
    try {
      setRaces(await getRaces());
      setRacesError("");
    } catch (error) {
      setRacesError(error.message);
    } finally {
      setRacesLoading(false);
    }
  }

  function handleAddDriver(data) {
    setDrivers([...drivers, { id: createId("drv"), ...data }]);
  }

  function handleUpdateDriver(id, data) {
    setDrivers(drivers.map((driver) => (driver.id === id ? { ...driver, ...data } : driver)));
  }

  function handleDeleteDriver(id) {
    if (participants.some((p) => p.driverId === id)) {
      window.alert("Driver tidak dapat dihapus karena sudah menjadi peserta race.");
      return;
    }
    setDrivers(drivers.filter((driver) => driver.id !== id));
  }

  function handleAddCar(data) {
    setCars([...cars, { id: createId("car"), ...data }]);
  }

  function handleUpdateCar(id, data) {
    setCars(cars.map((car) => (car.id === id ? { ...car, ...data } : car)));
  }

  function handleDeleteCar(id) {
    if (participants.some((p) => p.carId === id)) {
      window.alert("Mobil tidak dapat dihapus karena sudah dipakai peserta race.");
      return;
    }
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

  async function handleAddRace(data) {
    const race = await createRace(data);
    setRaces((current) => [...current, race]);
    setRacesError("");
  }

  async function handleUpdateRace(id, data) {
    const updatedRace = await updateRace(id, data);
    setRaces((current) => current.map((race) => (race.id === id ? updatedRace : race)));
    setRacesError("");
  }

  async function handleDeleteRace(id) {
    if (getById(races, id).status === "In Progress") {
      window.alert("Race yang sedang berjalan tidak dapat dihapus.");
      return;
    }
    await deleteRace(id);
    setRaces((current) => current.filter((race) => race.id !== id));
    setParticipants(participants.filter((p) => p.raceId !== id));
    setRacesError("");
  }

  function handleAddParticipant(data) {
    setParticipants([...participants, { id: createId("part"), ...data, finishPosition: null }]);
  }

  function handleUpdateParticipant(id, data) {
    setParticipants(participants.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }

  function handleDeleteParticipant(id) {
    setParticipants(participants.filter((p) => p.id !== id));
  }

  async function handleStartRace(id) {
    try {
      const race = await updateRace(id, {
        status: "In Progress",
        startTime: new Date().toISOString(),
        endTime: null,
        actualDuration: null,
      });
      setRaces((current) => current.map((item) => (item.id === id ? race : item)));
      setRacesError("");
    } catch (error) {
      setRacesError(error.message);
    }
  }

  async function handleFinishRace(id) {
    const race = getById(races, id);
    const endTime = new Date();
    try {
      const updatedRace = await updateRace(id, {
        status: "Finished",
        endTime: endTime.toISOString(),
        actualDuration: formatDuration(endTime.getTime() - new Date(race.startTime).getTime()),
      });
      setRaces((current) => current.map((item) => (item.id === id ? updatedRace : item)));
      setRacesError("");
    } catch (error) {
      setRacesError(error.message);
    }
  }

  function handleSaveResults(raceId, positions) {
    setParticipants(
      participants.map((p) =>
        p.raceId === raceId ? { ...p, finishPosition: positions[p.id] } : p
      )
    );
  }

  const stats = [
    { label: "Driver", value: drivers.length },
    { label: "Mobil", value: cars.length },
    { label: "Sirkuit", value: tracks.length },
    { label: "Race", value: races.length },
    { label: "Peserta", value: participants.length },
    { label: "Race Selesai", value: races.filter((race) => race.status === "Finished").length },
  ];

  return (
    <div className="app">
      <Header />
      <Navbar items={navItems} activePage={activePage} onNavigate={setActivePage} />
      <main className="main">
        {racesLoading && <p role="status">Memuat jadwal race dari backend...</p>}
        {racesError && (
          <div className="card">
            <p className="error">Backend jadwal race: {racesError}</p>
            <button type="button" className="btn" onClick={handleReloadRaces} disabled={racesLoading}>
              Coba lagi
            </button>
          </div>
        )}
        {activePage === "dashboard" && <Dashboard stats={stats} races={races} tracks={tracks} drivers={drivers} cars={cars} participants={participants} />}
        {activePage === "drivers" && <DriverPage drivers={drivers} onAdd={handleAddDriver} onUpdate={handleUpdateDriver} onDelete={handleDeleteDriver} />}
        {activePage === "cars" && <CarPage cars={cars} onAdd={handleAddCar} onUpdate={handleUpdateCar} onDelete={handleDeleteCar} />}
        {activePage === "tracks" && <TrackPage tracks={tracks} onAdd={handleAddTrack} onUpdate={handleUpdateTrack} onDelete={handleDeleteTrack} />}
        {activePage === "races" && <RacePage races={races} tracks={tracks} onAdd={handleAddRace} onUpdate={handleUpdateRace} onDelete={handleDeleteRace} />}
        {activePage === "participants" && <ParticipantPage races={races} drivers={drivers} cars={cars} participants={participants} onAdd={handleAddParticipant} onUpdate={handleUpdateParticipant} onDelete={handleDeleteParticipant} />}
        {activePage === "control" && <RaceControl races={races} tracks={tracks} participants={participants} onStart={handleStartRace} onFinish={handleFinishRace} />}
        {activePage === "results" && <ResultsPage races={races} drivers={drivers} cars={cars} participants={participants} onSaveResults={handleSaveResults} />}
      </main>
    </div>
  );
}

export default App;
