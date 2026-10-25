export function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export const CAR_CLASSES = ["GT3", "GT4", "LMP2", "Hypercar", "Formula"];
