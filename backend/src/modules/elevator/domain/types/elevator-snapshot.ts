import { Direction } from './direction';
import { DoorState } from './door-state';
import { ElevatorDisplayState } from './elevator-display-state';

export type ElevatorSnapshot = {
  id: string;
  buildingId: string;
  currentFloor: number;
  direction: Direction;
  doorState: DoorState;
  displayState: ElevatorDisplayState;
  stops: number[];
};
