import { Elevator } from '../entities/elevator';

export type BuildingState = {
  floors: number;
  elevators: Elevator[];
};
