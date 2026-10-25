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
