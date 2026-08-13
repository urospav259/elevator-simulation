import { BuildingStatePublisher } from '../ports/building-state.publisher';
import { ElevatorCallRepository } from '../ports/elevator-call.repository';
import { ElevatorRepository } from '../ports/elevator.repository';

export class MoveElevatorsUseCase {
  constructor(
    private readonly elevators: ElevatorRepository,
    private readonly elevatorCalls: ElevatorCallRepository,
    private readonly publisher: BuildingStatePublisher,
  ) {}

  async execute(buildingId: string): Promise<void> {
    const elevators = await this.elevators.list(buildingId);

    await Promise.all(
      elevators
        .filter((elevator) => elevator.getAssignedCalls().length > 0)
        .map(async (elevator) => {
          const completedCalls = elevator.moveToNextStop();

          await Promise.all(
            completedCalls.map((call) => this.elevatorCalls.save(call)),
          );

          await this.elevators.save(elevator);
        }),
    );

    await this.publisher.publish({ elevators, buildingId });
  }
}
