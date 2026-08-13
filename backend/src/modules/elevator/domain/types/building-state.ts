import { Elevator } from '../entities/elevator';

export type BuildingState = {
  buildingId: string;
  floors: number;
  elevators: Elevator[];
};
