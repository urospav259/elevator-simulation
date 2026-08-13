import { randomUUID } from 'crypto';

import { ElevatorCall } from '../../domain/entities/elevator-call';
import { ElevatorAssignmentService } from '../../domain/services/elevator-assignment.service';
import { ElevatorCallDto } from '../dto/elevator-call.dto';
import { BuildingStatePublisher } from '../ports/building-state.publisher';
import { ElevatorCallRepository } from '../ports/elevator-call.repository';
import { ElevatorRepository } from '../ports/elevator.repository';

export class CallElevatorsUseCase {
  constructor(
    private readonly elevatorRepository: ElevatorRepository,
    private readonly elevatorCallRepository: ElevatorCallRepository,
    private readonly publisher: BuildingStatePublisher,
    private readonly elevatorAssignmentService: ElevatorAssignmentService,
  ) {}

  async execute(elevatorCallPayload: ElevatorCallDto): Promise<void> {
    const elevatorCall = new ElevatorCall(
      randomUUID(),
      elevatorCallPayload.buildingId,
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

    elevatorCall.assignElevator(optimalElevator.getId());
    optimalElevator.addStop(elevatorCall);

    await this.elevatorCallRepository.save(elevatorCall);
    await this.elevatorRepository.save(optimalElevator);

    await this.publisher.publish({
      elevators,
      buildingId: elevatorCallPayload.buildingId,
    });
  }
}
