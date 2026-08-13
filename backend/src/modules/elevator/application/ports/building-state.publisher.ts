import { Elevator } from '../../domain/entities/elevator';
import { ElevatorSnapshot } from '../../domain/types/elevator-snapshot';

export const BUILDING_STATE_PUBLISHER = Symbol('BUILDING_STATE_PUBLISHER');

export interface BuildingStatePublisher {
  publish({
    elevators,
    buildingId,
  }: {
    elevators: Elevator[] | ElevatorSnapshot[];
    buildingId: string;
  }): Promise<void>;
}
