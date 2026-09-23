import { todayInKorea } from "./plan";

export function ageAt(birthDate: string, today = todayInKorea()): number {
  const year = Number(today.slice(0, 4)) - Number(birthDate.slice(0, 4));
  return year - (today.slice(5) < birthDate.slice(5) ? 1 : 0);
}

export function nearbyAges(age: number): number[] {
  return [-7, -2, 2, 7].map((offset) => Math.max(0, age + offset));
}
