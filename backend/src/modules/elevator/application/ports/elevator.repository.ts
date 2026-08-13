import { Elevator } from '../../domain/entities/elevator';

export const ELEVATOR_REPOSITORY = Symbol('ELEVATOR_REPOSITORY');

export interface ElevatorRepository {
  findById(id: string): Promise<Elevator | null>;
  list(buildingId: string): Promise<Elevator[]>;
  save(elevator: Elevator): Promise<void>;
}
