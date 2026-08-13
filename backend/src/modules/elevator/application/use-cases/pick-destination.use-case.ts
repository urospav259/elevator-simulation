import { randomUUID } from 'crypto';

import { ElevatorCall } from '../../domain/entities/elevator-call';
import { Direction } from '../../domain/types/direction';
import { ElevatorDestinationDto } from '../dto/elevator-destination.dto';
import { ElevatorCallRepository } from '../ports/elevator-call.repository';
import { ElevatorRepository } from '../ports/elevator.repository';

export class PickDestinationUseCase {
  constructor(
    private readonly elevators: ElevatorRepository,
    private readonly elevatorCallRepository: ElevatorCallRepository,
  ) {}

  async execute({ elevatorId, floor }: ElevatorDestinationDto): Promise<void> {
    const elevator = await this.elevators.findById(elevatorId);

    if (!elevator) {
      throw new Error('Elevator not found');
    }

    if (elevator.getCurrentFloor() === floor) {
      elevator.openDoor();
      await this.elevators.save(elevator);
      return;
    }

    const direction =
      elevator.getCurrentFloor() < floor ? Direction.UP : Direction.DOWN;

    const elevatorCall = new ElevatorCall(
      randomUUID(),
      elevator.getBuildingId(),
      floor,
      direction,
    );
    elevatorCall.assignElevator(elevatorId);

    elevator.addStop(elevatorCall);

    await this.elevatorCallRepository.save(elevatorCall);
    await this.elevators.save(elevator);
  }
}
