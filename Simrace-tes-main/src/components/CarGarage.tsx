import React, { useState } from 'react';
import {
  Car,
  Plus,
  Zap,
  Gauge,
  Flame,
  Scale,
  Sparkles,
  Palette,
  CheckCircle,
} from 'lucide-react';
import { useSimRacing } from '../context/SimRacingContext';
import { GT3Car } from '../types';

export const CarGarage: React.FC = () => {
  const { cars, addCar } = useSimRacing();

  const [activeFilter, setActiveFilter] = useState<'all' | 'factory' | 'custom'>('all');
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
  const [selectedCarDetails, setSelectedCarDetails] = useState<GT3Car | null>(null);

  // New Custom Car Form States
  const [modelName, setModelName] = useState('');
  const [manufacturer, setManufacturer] = useState('Apex Sim Racing Custom');
  const [engineSpec, setEngineSpec] = useState('4.0L Twin-Turbo Billet Flat-6');
  const [horsepower, setHorsepower] = useState(585);
  const [weightKg, setWeightKg] = useState(1250);
  const [topSpeedKmh, setTopSpeedKmh] = useState(296);
  const [aeroDownforce, setAeroDownforce] = useState<GT3Car['aeroDownforce']>('Very High');
  const [drivetrain, setDrivetrain] = useState<'RWD' | 'AWD'>('RWD');
  const [liveryPrimary, setLiveryPrimary] = useState('#ff2a5f');
  const [liverySecondary, setLiverySecondary] = useState('#0f172a');
  const [designer, setDesigner] = useState('Reval Saputra');
  const [accentBadge, setAccentBadge] = useState('Custom Aero Package');

  const filteredCars = cars.filter((car) => {
    if (activeFilter === 'factory') return !car.isCustom;
    if (activeFilter === 'custom') return car.isCustom;
    return true;
  });

  const handleBuildCarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName.trim()) return;

    await addCar({
      modelName: modelName.trim(),
      manufacturer: manufacturer.trim(),
      class: 'GT3',
      engineSpec: engineSpec.trim(),
      horsepower: Number(horsepower),
      weightKg: Number(weightKg),
      topSpeedKmh: Number(topSpeedKmh),
      aeroDownforce,
      drivetrain,
      liveryPrimary,
      liverySecondary,
      designer: designer.trim(),
      accentBadge: accentBadge.trim(),
    });

    setIsBuildModalOpen(false);
    setModelName('');
  };

  const getCarImage = (car: GT3Car) => {
    if (car.manufacturer.toLowerCase().includes('porsche')) {
      return '/src/assets/images/porsche_gt3_action_1792381216731.jpg';
    }
    if (car.manufacturer.toLowerCase().includes('ferrari')) {
      return '/src/assets/images/ferrari_gt3_action_1792381218595.jpg';
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
            GT3 Garage & Custom Car Builder
          </h1>
          <p className="text-xs md:text-sm text-neutral-400">
            Browse homologated FIA GT3 machines or design custom GT3 race cars with bespoke aero and liveries.
          </p>
        </div>

        <button
          onClick={() => setIsBuildModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-red-950/40 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Build Custom GT3 Car</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-neutral-900 border border-neutral-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeFilter === 'all'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          All GT3s ({cars.length})
        </button>
        <button
          onClick={() => setActiveFilter('factory')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeFilter === 'factory'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Factory Homologated ({cars.filter((c) => !c.isCustom).length})
        </button>
        <button
          onClick={() => setActiveFilter('custom')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeFilter === 'custom'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Custom Builds ({cars.filter((c) => c.isCustom).length})
        </button>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCars.map((car) => {
          const powerToWeight = (car.horsepower / car.weightKg * 1000).toFixed(1);
          const carImg = getCarImage(car);

          return (
            <div
              key={car.id}
              className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl overflow-hidden shadow-lg transition-all flex flex-col justify-between"
            >
              {/* Car Banner / Visual */}
              <div className="relative h-40 bg-neutral-900 overflow-hidden">
                {carImg ? (
                  <img
                    src={carImg}
                    alt={car.modelName}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center p-4 relative"
                    style={{
                      background: `linear-gradient(135deg, ${car.liverySecondary} 0%, #090c10 70%)`,
                    }}
                  >
                    <div
                      className="w-20 h-10 rounded-lg flex items-center justify-center border shadow-xl mb-2 font-mono font-black text-xs text-white"
                      style={{
                        backgroundColor: car.liveryPrimary,
                        borderColor: car.liverySecondary,
                      }}
                    >
                      GT3
                    </div>
                    <span className="text-xs font-mono text-neutral-400">{car.manufacturer}</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      car.isCustom
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                        : 'bg-neutral-900/80 text-neutral-300 border border-neutral-700'
                    }`}
                  >
                    {car.isCustom ? 'Custom Build' : 'FIA GT3'}
                  </span>
                </div>

                {/* Livery swatch circle */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-neutral-700">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: car.liveryPrimary }}
                  />
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: car.liverySecondary }}
                  />
                </div>
              </div>

              {/* Specs & Content */}
              <div className="p-5 space-y-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block">
                    {car.manufacturer}
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                    {car.modelName}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{car.engineSpec}</p>
                </div>

                {/* Telemetry & Spec Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-neutral-900/80 rounded-lg border border-neutral-800/80 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">Power</span>
                    <span className="text-xs font-bold text-white tabular-nums">
                      {car.horsepower} HP
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">Weight</span>
                    <span className="text-xs font-bold text-white tabular-nums">
                      {car.weightKg} kg
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block">Top Speed</span>
                    <span className="text-xs font-bold text-red-400 tabular-nums">
                      {car.topSpeedKmh} km/h
                    </span>
                  </div>
                </div>

                {/* Downforce & Ratio */}
                <div className="flex items-center justify-between text-xs text-neutral-400 pt-1 font-mono">
                  <span>Downforce: <strong className="text-neutral-200">{car.aeroDownforce}</strong></span>
                  <span>P/W: <strong className="text-amber-400">{powerToWeight} HP/ton</strong></span>
                </div>

                {car.accentBadge && (
                  <div className="text-[11px] text-neutral-400 bg-neutral-900/50 px-2.5 py-1 rounded border border-neutral-800 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{car.accentBadge}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-neutral-900 flex items-center justify-between text-xs">
                <span className="font-mono text-neutral-500">{car.drivetrain} Layout</span>
                <button
                  onClick={() => setSelectedCarDetails(car)}
                  className="text-red-400 hover:text-red-300 font-semibold"
                >
                  Technical Specs
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Build Custom GT3 Car */}
      {isBuildModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Custom GT3 Car Builder</h3>
                <p className="text-xs text-neutral-400">
                  Engineer custom aerodynamics, powertrain specs, and race livery colorways.
                </p>
              </div>
              <button
                onClick={() => setIsBuildModalOpen(false)}
                className="text-neutral-500 hover:text-white font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBuildCarSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Model Name</label>
                  <input
                    type="text"
                    required
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g. Apex HyperGT-R"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Manufacturer / Studio</label>
                  <input
                    type="text"
                    required
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="e.g. Apex Engineering"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-neutral-400">Engine Architecture</label>
                <input
                  type="text"
                  required
                  value={engineSpec}
                  onChange={(e) => setEngineSpec(e.target.value)}
                  placeholder="e.g. 4.0L Twin-Turbo Flat-6 Billet"
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Horsepower</label>
                  <input
                    type="number"
                    min={480}
                    max={650}
                    required
                    value={horsepower}
                    onChange={(e) => setHorsepower(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Weight (kg)</label>
                  <input
                    type="number"
                    min={1150}
                    max={1400}
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Top Speed (km/h)</label>
                  <input
                    type="number"
                    min={270}
                    max={320}
                    required
                    value={topSpeedKmh}
                    onChange={(e) => setTopSpeedKmh(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Aero Downforce</label>
                  <select
                    value={aeroDownforce}
                    onChange={(e) => setAeroDownforce(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                  >
                    <option value="Low">Low (Monza Trim)</option>
                    <option value="Medium">Medium (Balanced)</option>
                    <option value="High">High (High Downforce)</option>
                    <option value="Very High">Very High (Nordschleife Trim)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Drivetrain</label>
                  <select
                    value={drivetrain}
                    onChange={(e) => setDrivetrain(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                  >
                    <option value="RWD">RWD (FIA GT3 Standard)</option>
                    <option value="AWD">AWD (Hillclimb / Open)</option>
                  </select>
                </div>
              </div>

              {/* Livery Palette Customizer */}
              <div className="p-3 bg-neutral-900/70 rounded-lg border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-neutral-300">
                    Bespoke Livery Colorway
                  </label>
                  {/* Live preview badge */}
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-xs font-mono">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: liveryPrimary }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: liverySecondary }}
                    />
                    <span className="text-neutral-400">Live Preview</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-neutral-500 font-mono block">Primary Body Color</span>
                    <input
                      type="color"
                      value={liveryPrimary}
                      onChange={(e) => setLiveryPrimary(e.target.value)}
                      className="w-full h-9 bg-neutral-950 border border-neutral-800 rounded cursor-pointer mt-1"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-neutral-500 font-mono block">Secondary Accent Color</span>
                    <input
                      type="color"
                      value={liverySecondary}
                      onChange={(e) => setLiverySecondary(e.target.value)}
                      className="w-full h-9 bg-neutral-950 border border-neutral-800 rounded cursor-pointer mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Designer</label>
                  <input
                    type="text"
                    value={designer}
                    onChange={(e) => setDesigner(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-neutral-400">Custom Accent Badge</label>
                  <input
                    type="text"
                    value={accentBadge}
                    onChange={(e) => setAccentBadge(e.target.value)}
                    placeholder="e.g. Apex Carbon Aero"
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsBuildModalOpen(false)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-red-950/40"
                >
                  Save to GT3 Garage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Technical Specs Details */}
      {selectedCarDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {selectedCarDetails.manufacturer} {selectedCarDetails.modelName}
                </h3>
                <span className="text-xs text-neutral-400">FIA GT3 Homologation Dossier</span>
              </div>
              <button
                onClick={() => setSelectedCarDetails(null)}
                className="text-neutral-500 hover:text-white font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500 block">Engine Configuration</span>
                  <span className="text-sm font-bold text-white">{selectedCarDetails.engineSpec}</span>
                </div>
                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500 block">Power Output</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    {selectedCarDetails.horsepower} BHP
                  </span>
                </div>
                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500 block">Dry Weight</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {selectedCarDetails.weightKg} kg (BoP Spec)
                  </span>
                </div>
                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                  <span className="text-neutral-500 block">Top Speed</span>
                  <span className="text-sm font-bold text-red-400 font-mono">
                    {selectedCarDetails.topSpeedKmh} km/h
                  </span>
                </div>
              </div>

              <div className="p-3 bg-neutral-900/60 rounded-lg border border-neutral-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Aero Package:</span>
                  <span className="text-white font-bold">{selectedCarDetails.aeroDownforce}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Drivetrain:</span>
                  <span className="text-white font-bold">{selectedCarDetails.drivetrain}</span>
                </div>
                {selectedCarDetails.designer && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Designer / Workshop:</span>
                    <span className="text-amber-400 font-semibold">{selectedCarDetails.designer}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCarDetails(null)}
                className="px-4 py-2 bg-neutral-900 text-neutral-300 hover:text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
