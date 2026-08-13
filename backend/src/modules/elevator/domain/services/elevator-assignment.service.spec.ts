import { describe, expect, it } from '@jest/globals';

import { Elevator } from '../entities/elevator';
import { ElevatorCall } from '../entities/elevator-call';
import { Direction } from '../types/direction';
import { DoorState } from '../types/door-state';
import { ElevatorAssignmentService } from './elevator-assignment.service';

describe('ElevatorAssignmentService', () => {
  const service = new ElevatorAssignmentService();

  it('selects an idle elevator with the shortest distance', () => {
    const elevators = [
      new Elevator('far', 1, Direction.IDLE, DoorState.CLOSED, 'building-id'),
      new Elevator('near', 5, Direction.IDLE, DoorState.CLOSED, 'building-id'),
    ];
    const call = new ElevatorCall('call-id', 'building-id', 6, Direction.UP);

    const result = service.getOptimalElevatorForAssignment(call, elevators);

    expect(result.getId()).toBe('near');
  });

  it('prefers an elevator already moving in the requested direction on the way', () => {
    const onTheWay = new Elevator(
      'on-the-way',
      3,
      Direction.UP,
      DoorState.CLOSED,
      'building-id',
      [new ElevatorCall('existing-call', 'building-id', 9, Direction.UP)],
    );
    const idleButFar = new Elevator(
      'idle-far',
      10,
      Direction.IDLE,
      DoorState.CLOSED,
      'building-id',
    );
    const call = new ElevatorCall('call-id', 'building-id', 6, Direction.UP);

    const result = service.getOptimalElevatorForAssignment(call, [
      idleButFar,
      onTheWay,
    ]);

    expect(result.getId()).toBe('on-the-way');
  });
});
