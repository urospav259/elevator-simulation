import { Elevator } from '../../domain/entities/elevator';

export const BUILDING_STATE_PUBLISHER = Symbol('BUILDING_STATE_PUBLISHER');

export interface BuildingStatePublisher {
  publish({
    elevators,
    buildingId,
  }: {
    elevators: Elevator[];
    buildingId: string;
  }): Promise<void>;
}
