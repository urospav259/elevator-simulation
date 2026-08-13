import { describe, expect, it } from '@jest/globals';

import { Elevator } from './elevator';
import { ElevatorCall } from './elevator-call';
import { Direction } from '../types/direction';
import { DoorState } from '../types/door-state';
import { CallStatus } from '../types/call-status';
import { ElevatorDisplayState } from '../types/elevator-display-state';

describe('Elevator', () => {
  it('sets direction when a future stop is added', () => {
    const elevator = new Elevator(
      'elevator-id',
      1,
      Direction.IDLE,
      DoorState.CLOSED,
      'building-id',
    );
    const call = new ElevatorCall('call-id', 'building-id', 5, Direction.UP);

    elevator.addStop(call);

    expect(elevator.getDirection()).toBe(Direction.UP);
    expect(elevator.getStops()).toEqual([5]);
    expect(elevator.getDisplayState()).toBe(ElevatorDisplayState.MOVING);
  });

  it('moves to a stop, opens the door and completes the call', () => {
    const elevator = new Elevator(
      'elevator-id',
      1,
      Direction.IDLE,
      DoorState.CLOSED,
      'building-id',
    );
    const call = new ElevatorCall('call-id', 'building-id', 2, Direction.UP);
    call.assignElevator(elevator.getId());

    elevator.addStop(call);
    const completedCalls = elevator.moveToNextStop();

    expect(elevator.getCurrentFloor()).toBe(2);
    expect(elevator.getDoorState()).toBe(DoorState.OPEN);
    expect(elevator.getDirection()).toBe(Direction.IDLE);
    expect(completedCalls).toHaveLength(1);
    expect(completedCalls[0].getStatus()).toBe(CallStatus.COMPLETED);
    expect(elevator.getStops()).toEqual([]);
  });

  it('opens the door and completes same-floor calls immediately', () => {
    const elevator = new Elevator(
      'elevator-id',
      4,
      Direction.IDLE,
      DoorState.CLOSED,
      'building-id',
    );
    const call = new ElevatorCall('call-id', 'building-id', 4, Direction.UP);

    elevator.addStop(call);

    expect(elevator.getDoorState()).toBe(DoorState.OPEN);
    expect(elevator.getDirection()).toBe(Direction.IDLE);
    expect(call.getStatus()).toBe(CallStatus.COMPLETED);
    expect(elevator.getAssignedCalls()).toEqual([]);
  });
});
