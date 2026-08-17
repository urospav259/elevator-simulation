export const Direction = {
  UP: "UP",
  DOWN: "DOWN",
  IDLE: "IDLE",
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];
export type CallDirection = typeof Direction.UP | typeof Direction.DOWN;

export const DoorState = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
} as const;

export type DoorState = (typeof DoorState)[keyof typeof DoorState];

export const ElevatorDisplayState = {
  IDLE: "IDLE",
  MOVING: "MOVING",
  DOOR_OPEN: "DOOR_OPEN",
} as const;

export type ElevatorDisplayState =
  (typeof ElevatorDisplayState)[keyof typeof ElevatorDisplayState];

export type ElevatorSnapshot = {
  id: string;
  buildingId: string;
  currentFloor: number;
  direction: Direction;
  doorState: DoorState;
  displayState: ElevatorDisplayState;
  stops: number[];
};

export type Building = {
  id: string;
  name: string;
  numberOfFloors: number;
  elevators: ElevatorSnapshot[];
};

export type BuildingState = {
  buildingId: string;
  floors: number;
  elevators: ElevatorSnapshot[];
};

export type BuildingStateEvent = {
  buildingId: string;
  floors?: number;
  elevators: ElevatorSnapshot[];
};

export type CreateBuildingPayload = {
  name: string;
  floors: number;
  elevators: number;
};

export type CallElevatorPayload = {
  buildingId: string;
  floor: number;
  direction: CallDirection;
};

export type PickDestinationPayload = {
  elevatorId: string;
  floor: number;
};

export type PassengerSession = {
  floor: number;
  direction: CallDirection;
  elevatorId?: string;
  destinationFloor?: number;
};
