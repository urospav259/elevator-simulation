import { describe, expect, it } from '@jest/globals';

import { PickDestinationUseCase } from './pick-destination.use-case';
import { Elevator } from '../../domain/entities/elevator';
import { ElevatorCall } from '../../domain/entities/elevator-call';
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

describe('PickDestinationUseCase', () => {
  it('does not allow choosing a destination before elevator doors are open', async () => {
    const elevator = new Elevator(
      'elevator-id',
      3,
      Direction.IDLE,
      DoorState.CLOSED,
      'building-id',
    );
    const elevatorRepository = new FakeElevatorRepository([elevator]);
    const callRepository = new FakeElevatorCallRepository();
    const publisher = new FakeBuildingStatePublisher();
    const useCase = new PickDestinationUseCase(
      elevatorRepository,
      callRepository,
      publisher,
    );

    await expect(
      useCase.execute({ elevatorId: 'elevator-id', floor: 8 }),
    ).rejects.toThrow('Cannot pick destination before entering elevator');
    expect(callRepository.savedCall).toBeNull();
    expect(elevatorRepository.savedElevator).toBeNull();
    expect(publisher.publishedState).toBeNull();
  });

  it('adds a destination stop to an elevator with open doors and publishes full building state', async () => {
    const elevator = new Elevator(
      'elevator-id',
      3,
      Direction.IDLE,
      DoorState.OPEN,
      'building-id',
    );
    const otherElevator = new Elevator(
      'other-elevator-id',
      7,
      Direction.IDLE,
      DoorState.CLOSED,
      'building-id',
    );
    const elevatorRepository = new FakeElevatorRepository([
      elevator,
      otherElevator,
    ]);
    const callRepository = new FakeElevatorCallRepository();
    const publisher = new FakeBuildingStatePublisher();
    const useCase = new PickDestinationUseCase(
      elevatorRepository,
      callRepository,
      publisher,
    );

    await useCase.execute({ elevatorId: 'elevator-id', floor: 8 });

    expect(callRepository.savedCall?.getAssignedElevatorId()).toBe(
      'elevator-id',
    );
    expect(elevatorRepository.savedElevator?.getStops()).toEqual([8]);
    expect(publisher.publishedState?.buildingId).toBe('building-id');
    expect(publisher.publishedState?.elevators).toHaveLength(2);
    expect(
      publisher.publishedState?.elevators.map((item) => item.getId()),
    ).toEqual(['elevator-id', 'other-elevator-id']);
  });
});
