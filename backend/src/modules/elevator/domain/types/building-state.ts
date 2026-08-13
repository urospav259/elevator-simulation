import { ElevatorSnapshot } from './elevator-snapshot';

export type BuildingState = {
  buildingId: string;
  floors: number;
  elevators: ElevatorSnapshot[];
};
