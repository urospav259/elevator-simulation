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

  it('does not treat elevators moving in the opposite direction as relevant when an idle elevator is available', () => {
    const oppositeDirection = new Elevator(
      'opposite-direction',
      3,
      Direction.DOWN,
      DoorState.CLOSED,
      'building-id',
      [new ElevatorCall('existing-call', 'building-id', 1, Direction.DOWN)],
    );
    const idle = new Elevator(
      'idle',
      9,
      Direction.IDLE,
      DoorState.CLOSED,
      'building-id',
    );
    const call = new ElevatorCall('call-id', 'building-id', 4, Direction.UP);

    const result = service.getOptimalElevatorForAssignment(call, [
      oppositeDirection,
      idle,
    ]);

    expect(result.getId()).toBe('idle');
  });

  it('falls back to the least expensive route when every elevator is moving in the opposite direction', () => {
    const closerAfterTurnaround = new Elevator(
      'closer-after-turnaround',
      8,
      Direction.DOWN,
      DoorState.CLOSED,
      'building-id',
      [new ElevatorCall('existing-call-1', 'building-id', 6, Direction.DOWN)],
    );
    const fartherAfterTurnaround = new Elevator(
      'farther-after-turnaround',
      10,
      Direction.DOWN,
      DoorState.CLOSED,
      'building-id',
      [new ElevatorCall('existing-call-2', 'building-id', 1, Direction.DOWN)],
    );
    const call = new ElevatorCall('call-id', 'building-id', 7, Direction.UP);

    const result = service.getOptimalElevatorForAssignment(call, [
      fartherAfterTurnaround,
      closerAfterTurnaround,
    ]);

    expect(result.getId()).toBe('closer-after-turnaround');
  });
});
