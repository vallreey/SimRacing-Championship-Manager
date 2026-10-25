export const initialDrivers = [
  { id: "drv-1", name: "Rafi Pratama", country: "Indonesia", number: 7 },
  { id: "drv-2", name: "Lucas Meyer", country: "Jerman", number: 12 },
  { id: "drv-3", name: "Kenji Tanaka", country: "Jepang", number: 27 },
  { id: "drv-4", name: "Oliver Smith", country: "Inggris", number: 44 },
  { id: "drv-5", name: "Mateo Rossi", country: "Italia", number: 51 },
  { id: "drv-6", name: "Dimas Aditya", country: "Indonesia", number: 88 },
];

export const initialCars = [
  { id: "car-1", name: "Mercedes-AMG GT3 Evo", manufacturer: "Mercedes-AMG", carClass: "GT3" },
  { id: "car-2", name: "Porsche 911 GT3 R", manufacturer: "Porsche", carClass: "GT3" },
  { id: "car-3", name: "Ferrari 296 GT3", manufacturer: "Ferrari", carClass: "GT3" },
  { id: "car-4", name: "BMW M4 GT3", manufacturer: "BMW", carClass: "GT3" },
  { id: "car-5", name: "Toyota GR010 Hybrid", manufacturer: "Toyota", carClass: "Hypercar" },
];

export const initialTracks = [
  { id: "trk-1", name: "Autodromo Nazionale Monza", country: "Italia", length: 5.793 },
  { id: "trk-2", name: "Circuit de Spa-Francorchamps", country: "Belgia", length: 7.004 },
  { id: "trk-3", name: "Suzuka Circuit", country: "Jepang", length: 5.807 },
  { id: "trk-4", name: "Sirkuit Internasional Sentul", country: "Indonesia", length: 3.965 },
];

export const initialRaces = [
  {
    id: "race-1",
    name: "Round 2 - Monza Sprint",
    trackId: "trk-1",
    date: "2026-11-07",
    time: "19:00",
    plannedDuration: 60,
    status: "Scheduled",
    startTime: null,
    endTime: null,
    actualDuration: null,
  },
  {
    id: "race-2",
    name: "Round 3 - Spa Endurance",
    trackId: "trk-2",
    date: "2026-11-21",
    time: "20:00",
    plannedDuration: 120,
    status: "Scheduled",
    startTime: null,
    endTime: null,
    actualDuration: null,
  },
  {
    id: "race-3",
    name: "Round 1 - Suzuka Opening",
    trackId: "trk-3",
    date: "2026-10-10",
    time: "19:30",
    plannedDuration: 90,
    status: "Finished",
    startTime: "2026-10-10T12:30:00.000Z",
    endTime: "2026-10-10T14:03:00.000Z",
    actualDuration: "01:33",
  },
];
