import { Direction, ElevatorDisplayState } from "@/types/elevator";

export function getDirectionLabel(direction: Direction): string {
  if (direction === "UP") {
    return "Up";
  }

  if (direction === "DOWN") {
    return "Down";
  }

  return "Idle";
}

export function getDisplayLabel(displayState: ElevatorDisplayState): string {
  if (displayState === "DOOR_OPEN") {
    return "Door open";
  }

  if (displayState === "MOVING") {
    return "Moving";
  }

  return "Idle";
}

export function getDirectionSymbol(direction: Direction): string {
  if (direction === "UP") {
    return "↑";
  }

  if (direction === "DOWN") {
    return "↓";
  }

  return "-";
}
