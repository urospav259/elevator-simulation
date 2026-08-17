import { randomUUID } from 'crypto';

import { ElevatorCall } from '../../domain/entities/elevator-call';
import { Direction } from '../../domain/types/direction';
import { PickDestinationCommand } from '../commands/pick-destination.command';
import { BuildingStatePublisher } from '../ports/building-state.publisher';
import { ElevatorCallRepository } from '../ports/elevator-call.repository';
import { ElevatorRepository } from '../ports/elevator.repository';

export class PickDestinationUseCase {
  constructor(
    private readonly elevators: ElevatorRepository,
    private readonly elevatorCallRepository: ElevatorCallRepository,
    private readonly buildingStatePublisher: BuildingStatePublisher,
  ) {}

  async execute({ elevatorId, floor }: PickDestinationCommand): Promise<void> {
    const elevator = await this.elevators.findById(elevatorId);

    if (!elevator) {
      throw new Error('Elevator not found');
    }

    if (elevator.getCurrentFloor() === floor) {
      elevator.openDoor();
      await this.elevators.save(elevator);
      await this.buildingStatePublisher.publish({
        buildingId: elevator.getBuildingId(),
        elevators: [elevator],
      });
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
    await this.buildingStatePublisher.publish({
      buildingId: elevator.getBuildingId(),
      elevators: [elevator],
    });
  }
}
