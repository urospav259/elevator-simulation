import { Elevator } from '../../domen/entities/elevator';

export const ELEVATOR_REPOSITORY = Symbol('ELEVATOR_REPOSITORY');

export interface ElevatorRepository {
  findById(id: string): Promise<Elevator | null>;
  list(): Promise<Elevator[]>;
  save(elevator: Elevator): Promise<void>;
}
