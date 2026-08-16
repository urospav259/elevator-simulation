import {
  Direction,
  DoorState,
  ElevatorDisplayState,
  type Building,
  type BuildingStateEvent,
  type ElevatorSnapshot,
} from "@/types/elevator";

function normalizeElevator(raw: unknown): ElevatorSnapshot {
  const value = raw as Partial<ElevatorSnapshot>;

  return {
    id: String(value.id ?? ""),
    buildingId: String(value.buildingId ?? ""),
    currentFloor: Number(value.currentFloor ?? 0),
    direction: value.direction ?? Direction.IDLE,
    doorState: value.doorState ?? DoorState.CLOSED,
    displayState: value.displayState ?? ElevatorDisplayState.IDLE,
    stops: Array.isArray(value.stops) ? value.stops.map(Number) : [],
  };
}

export function normalizeBuilding(raw: unknown): Building {
  const value = raw as Partial<Building> & {
    floors?: number;
    floorsCount?: number;
  };

  return {
    id: String(value.id ?? ""),
    name: String(value.name ?? "Untitled building"),
    numberOfFloors: Number(
      value.numberOfFloors ?? value.floors ?? value.floorsCount ?? 0,
    ),
    elevators: Array.isArray(value.elevators)
      ? value.elevators.map(normalizeElevator)
      : [],
  };
}

export function normalizeBuildingState(
  raw: BuildingStateEvent,
): BuildingStateEvent {
  return {
    buildingId: String(raw.buildingId),
    floors: raw.floors === undefined ? undefined : Number(raw.floors),
    elevators: Array.isArray(raw.elevators)
      ? raw.elevators.map(normalizeElevator)
      : [],
  };
}
