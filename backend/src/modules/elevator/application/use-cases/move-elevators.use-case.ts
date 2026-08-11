import { BuildingStatePublisher } from '../ports/building-state.publisher';
import { ElevatorRepository } from '../ports/elevator.repository';
import { GetBuildingStateUseCase } from './get-building-state.use-case';

export class MoveElevatorsUseCase {
  constructor(
    private readonly elevators: ElevatorRepository,
    private readonly getBuildingState: GetBuildingStateUseCase,
    private readonly publisher: BuildingStatePublisher,
  ) {}

  async execute(): Promise<void> {
    try {
      const elevators = await this.elevators.list();

      // just move elevators to their new positions, if it is needed
      elevators
        .filter((elevator) => elevator.getAssignedCalls().length > 0)
        .forEach((elevator) => elevator.moveToNextStop());

      this.publisher.publish({
        elevators,
        floors: 10,
      });
    } catch (error: Error | any) {
      // handle error
    }
  }
}
