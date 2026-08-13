import { randomUUID } from 'crypto';

import { Direction } from '../../domain/types/direction';
import { ElevatorCall } from '../../domain/entities/elevator-call';
import { ElevatorRepository } from '../ports/elevator.repository';
import { GetBuildingStateUseCase } from './get-building-state.use-case';
import { BuildingStatePublisher } from '../ports/building-state.publisher';
import { ElevatorAssignmentService } from '../../domain/services/elevator-assignment.service';
import { CallStatus } from '../../domain/types/call-status';
import { ElevatorCallDto } from '../dto/elevator-call.dto';

export class CallElevatorsUseCase {
  constructor(
    private readonly elevatorRepository: ElevatorRepository,
    private readonly getBuildingState: GetBuildingStateUseCase,
    private readonly publisher: BuildingStatePublisher,
    private readonly elevatorAssignmentService: ElevatorAssignmentService,
  ) {}

  async execute(elevatorCallPayload: ElevatorCallDto): Promise<void> {
    try {
      const elevatorCall = new ElevatorCall(
        randomUUID(),
        elevatorCallPayload.floor,
        elevatorCallPayload.direction,
      );
      const elevators = await this.elevatorRepository.list(
        elevatorCallPayload.buildingId,
      );

      const optimalElevator =
        this.elevatorAssignmentService.getOptimalElevatorForAssignment(
          elevatorCall,
          elevators,
        );

      optimalElevator.addStop(elevatorCall);

      this.elevatorRepository.save(optimalElevator);

      this.publisher.publish({
        elevators,
        buildingId: elevatorCallPayload.buildingId,
      });
    } catch (error: Error | any) {
      // handle error
    }
  }
}
