import type { UnitPreference } from "@/models/User";

const KG_TO_LB = 2.2046226218;

export function toDisplayWeight(kg: number, unit: UnitPreference): number {
  return unit === "lb" ? Math.round(kg * KG_TO_LB * 10) / 10 : kg;
}

export function fromDisplayWeight(value: number, unit: UnitPreference): number {
  return unit === "lb" ? Math.round((value / KG_TO_LB) * 10) / 10 : value;
}

export function unitLabel(unit: UnitPreference): string {
  return unit;
}
