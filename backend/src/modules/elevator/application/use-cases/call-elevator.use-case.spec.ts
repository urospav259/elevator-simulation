import { describe, expect, it } from '@jest/globals';

import { CallElevatorsUseCase } from './call-elevator.use-case';
import { Elevator } from '../../domain/entities/elevator';
import { ElevatorCall } from '../../domain/entities/elevator-call';
import { ElevatorAssignmentService } from '../../domain/services/elevator-assignment.service';
import { CallStatus } from '../../domain/types/call-status';
import { Direction } from '../../domain/types/direction';
import { DoorState } from '../../domain/types/door-state';
import { BuildingStatePublisher } from '../ports/building-state.publisher';
import { ElevatorCallRepository } from '../ports/elevator-call.repository';
import { ElevatorRepository } from '../ports/elevator.repository';

class FakeElevatorRepository implements ElevatorRepository {
  savedElevator: Elevator | null = null;

  constructor(private readonly elevators: Elevator[]) {}

  async findById(id: string): Promise<Elevator | null> {
    return this.elevators.find((elevator) => elevator.getId() === id) ?? null;
  }

  async list(buildingId: string): Promise<Elevator[]> {
    return this.elevators.filter(
      (elevator) => elevator.getBuildingId() === buildingId,
    );
  }

  async save(elevator: Elevator): Promise<void> {
    this.savedElevator = elevator;
  }
}

class FakeElevatorCallRepository implements ElevatorCallRepository {
  savedCall: ElevatorCall | null = null;

  async findById(): Promise<ElevatorCall | null> {
    return null;
  }

  async save(call: ElevatorCall): Promise<void> {
    this.savedCall = call;
  }
}

class FakeBuildingStatePublisher implements BuildingStatePublisher {
  publishedState: { elevators: Elevator[]; buildingId: string } | null = null;

  async publish(state: {
    elevators: Elevator[];
    buildingId: string;
  }): Promise<void> {
    this.publishedState = state;
  }
}

describe('CallElevatorsUseCase', () => {
  it('assigns a call to the optimal elevator and persists both records', async () => {
    const elevators = [
      new Elevator(
        'elevator-1',
        1,
        Direction.IDLE,
        DoorState.CLOSED,
        'building-id',
      ),
      new Elevator(
        'elevator-2',
        8,
        Direction.IDLE,
        DoorState.CLOSED,
        'building-id',
      ),
    ];
    const elevatorRepository = new FakeElevatorRepository(elevators);
    const callRepository = new FakeElevatorCallRepository();
    const publisher = new FakeBuildingStatePublisher();
    const useCase = new CallElevatorsUseCase(
      elevatorRepository,
      callRepository,
      publisher,
      new ElevatorAssignmentService(),
    );

    await useCase.execute({
      buildingId: 'building-id',
      floor: 7,
      direction: Direction.DOWN,
    });

    expect(callRepository.savedCall).not.toBeNull();
    expect(callRepository.savedCall?.getStatus()).toBe(CallStatus.ASSIGNED);
    expect(callRepository.savedCall?.getAssignedElevatorId()).toBe(
      'elevator-2',
    );
    expect(elevatorRepository.savedElevator?.getId()).toBe('elevator-2');
    expect(elevatorRepository.savedElevator?.getStops()).toEqual([7]);
    expect(publisher.publishedState?.buildingId).toBe('building-id');
  });
});
