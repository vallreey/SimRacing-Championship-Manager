import mercedesImage from "../assets/mercedes-amg-gt3.png";
import porscheImage from "../assets/Porsche 911 GT3 R.jpg";
import ferrariImage from "../assets/Ferrari 296 GT3.png";
import bmwImage from "../assets/BMW M4 GT3.jpg";
import toyotaImage from "../assets/Toyota GR010 Hybrid.jpg";
import monzaImage from "../assets/Autodromo Nazionale Monza.jpg";
import spaImage from "../assets/Circuit de Spa-Francorchamps.jpg";
import suzukaImage from "../assets/Suzuka Circuit.jpg";
import sentulImage from "../assets/Sirkuit Internasional Sentul.jpg";

export const initialDrivers = [
  { id: "drv-1", name: "Rafi Pratama", country: "Indonesia", number: 7 },
  { id: "drv-2", name: "Lucas Meyer", country: "Jerman", number: 12 },
  { id: "drv-3", name: "Kenji Tanaka", country: "Jepang", number: 27 },
  { id: "drv-4", name: "Oliver Smith", country: "Inggris", number: 44 },
  { id: "drv-5", name: "Mateo Rossi", country: "Italia", number: 51 },
  { id: "drv-6", name: "Dimas Aditya", country: "Indonesia", number: 88 },
];

export const initialCars = [
  { id: "car-1", name: "Mercedes-AMG GT3 Evo", manufacturer: "Mercedes-AMG", carClass: "GT3", image: mercedesImage },
  { id: "car-2", name: "Porsche 911 GT3 R", manufacturer: "Porsche", carClass: "GT3", image: porscheImage },
  { id: "car-3", name: "Ferrari 296 GT3", manufacturer: "Ferrari", carClass: "GT3", image: ferrariImage },
  { id: "car-4", name: "BMW M4 GT3", manufacturer: "BMW", carClass: "GT3", image: bmwImage },
  { id: "car-5", name: "Toyota GR010 Hybrid", manufacturer: "Toyota", carClass: "Hypercar", image: toyotaImage },
];

export const initialTracks = [
  { id: "trk-1", name: "Autodromo Nazionale Monza", country: "Italia", length: 5.793, image: monzaImage },
  { id: "trk-2", name: "Circuit de Spa-Francorchamps", country: "Belgia", length: 7.004, image: spaImage },
  { id: "trk-3", name: "Suzuka Circuit", country: "Jepang", length: 5.807, image: suzukaImage },
  { id: "trk-4", name: "Sirkuit Internasional Sentul", country: "Indonesia", length: 3.965, image: sentulImage },
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

export const initialParticipants = [
  { id: "part-1", raceId: "race-3", driverId: "drv-1", carId: "car-1", gridPosition: 1, finishPosition: 2 },
  { id: "part-2", raceId: "race-3", driverId: "drv-2", carId: "car-2", gridPosition: 2, finishPosition: 1 },
  { id: "part-3", raceId: "race-3", driverId: "drv-3", carId: "car-3", gridPosition: 3, finishPosition: 3 },
  { id: "part-4", raceId: "race-3", driverId: "drv-4", carId: "car-4", gridPosition: 4, finishPosition: 4 },
  { id: "part-5", raceId: "race-1", driverId: "drv-1", carId: "car-1", gridPosition: 1, finishPosition: null },
  { id: "part-6", raceId: "race-1", driverId: "drv-5", carId: "car-3", gridPosition: 2, finishPosition: null },
  { id: "part-7", raceId: "race-1", driverId: "drv-6", carId: "car-2", gridPosition: 3, finishPosition: null },
];
