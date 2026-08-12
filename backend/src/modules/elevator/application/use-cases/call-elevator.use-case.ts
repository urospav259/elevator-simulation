import { randomUUID } from 'crypto';

import { Direction } from '../../domain/types/direction';
import { ElevatorCall } from '../../domain/entities/elevator-call';
import { ElevatorRepository } from '../ports/elevator.repository';
import { GetBuildingStateUseCase } from './get-building-state.use-case';
import { BuildingStatePublisher } from '../ports/building-state.publisher';
import { ElevatorAssignmentService } from '../../domain/services/elevator-assignment.service';
import { CallStatus } from '../../domain/types/call-status';

export class CallElevatorsUseCase {
  constructor(
    private readonly elevators: ElevatorRepository,
    private readonly getBuildingState: GetBuildingStateUseCase,
    private readonly publisher: BuildingStatePublisher,
    private readonly elevatorAssignmentService: ElevatorAssignmentService,
  ) {}

  async execute(elevatorCallPayload: {
    floor: number;
    direction: Exclude<Direction, Direction.IDLE>;
  }): Promise<void> {
    try {
      const elevatorCall = new ElevatorCall(
        randomUUID(),
        elevatorCallPayload.floor,
        elevatorCallPayload.direction,
      );
      const elevators = await this.elevators.list();

      const optimalElevator =
        this.elevatorAssignmentService.getOptimalElevatorForAssignment(
          elevatorCall,
          elevators,
        );

      optimalElevator.addStop(elevatorCall);

      this.publisher.publish({
        elevators,
        floors: 10,
      });
    } catch (error: Error | any) {
      // handle error
    }
  }
}
