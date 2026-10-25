export function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export const CAR_CLASSES = ["GT3", "GT4", "LMP2", "Hypercar", "Formula"];

function pad(number) {
  return String(number).padStart(2, "0");
}

export function getById(list, id) {
  return list.find((item) => item.id === id);
}

export function formatMinutes(totalMinutes) {
  return `${pad(Math.floor(totalMinutes / 60))}:${pad(totalMinutes % 60)}`;
}

export function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatClock(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(milliseconds) {
  return formatMinutes(Math.floor(milliseconds / 60000));
}
