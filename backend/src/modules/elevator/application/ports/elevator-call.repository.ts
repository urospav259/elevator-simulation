import { ElevatorCall } from '../../domen/entities/elevator-call';

export const ELEVATOR_CALL_REPOSITORY = Symbol('ELEVATOR_CALL_REPOSITORY');

export interface ElevatorCallRepository {
  findById(id: string): Promise<ElevatorCall | null>;
  save(call: ElevatorCall): Promise<void>;
}
