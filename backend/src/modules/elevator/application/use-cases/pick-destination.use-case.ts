import { randomUUID } from 'crypto';
import { Direction } from '../../domain/types/direction';
import { ElevatorRepository } from '../ports/elevator.repository';
import { ElevatorCall } from '../../domain/entities/elevator-call';
import { ElevatorDestinationDto } from '../dto/elevator-destination.dto';
import { ElevatorCallRepository } from '../ports/elevator-call.repository';

export class PickDestinationUseCase {
  constructor(
    private readonly elevators: ElevatorRepository,
    private readonly elevatorCallRepository: ElevatorCallRepository,
  ) {}

  async execute({ elevatorId, floor }: ElevatorDestinationDto): Promise<void> {
    try {
      const elevator = await this.elevators.findById(elevatorId);

      const direction =
        elevator.getCurrentFloor() < floor ? Direction.UP : Direction.DOWN;

      const elevatorCall = new ElevatorCall(randomUUID(), floor, direction);
      elevatorCall.assignElevator(elevatorId);

      await this.elevatorCallRepository.save(elevatorCall);
      elevator.addStop(elevatorCall);

      await this.elevators.save(elevator);
    } catch (error: Error | any) {
      // handle error
    }
  }
}
