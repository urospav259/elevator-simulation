import { Direction } from '../types/direction';
import { DoorState } from '../types/door-state';
import { ElevatorCall } from './elevator-call';

export class Elevator {
  private assignedCalls: ElevatorCall[];

  constructor(
    private readonly id: string,
    private currentFloor: number,
    private direction: Direction,
    private doorState: DoorState,
    private readonly buildingId: string,
    assignedCalls: ElevatorCall[] = [],
  ) {
    this.assignedCalls = assignedCalls;
  }

  addStop(call: ElevatorCall): void {
    if (call.getCurrentLocation() === this.currentFloor) {
      this.openDoor();
      call.finishElevatorCall();
      return;
    }

    this.assignedCalls.push(call);

    if (this.direction === Direction.IDLE) {
      this.direction = this.getDirectionToFloor(call.getCurrentLocation());
    }
  }

  resetStops(): void {
    this.assignedCalls = [];
    this.direction = Direction.IDLE;
  }

  getAssignedCalls(): ElevatorCall[] {
    return this.assignedCalls;
  }

  getId(): string {
    return this.id;
  }

  getBuildingId(): string {
    return this.buildingId;
  }

  getDirection(): Direction {
    return this.direction;
  }

  getDoorState(): DoorState {
    return this.doorState;
  }

  get stops(): number[] {
    return this.getStops();
  }

  getStops(): number[] {
    const allStops = this.assignedCalls.map((call: ElevatorCall) =>
      call.getCurrentLocation(),
    );

    return this.getOrderedStops([...new Set(allStops)]);
  }

  private getOrderedStops(stops: number[]): number[] {
    const above = stops
      .filter((stop: number) => stop > this.currentFloor)
      .sort((a, b) => (this.direction === Direction.UP ? a - b : b - a));

    const below = stops
      .filter((stop: number) => stop < this.currentFloor)
      .sort((a, b) => (this.direction === Direction.UP ? b - a : a - b));

    return this.direction === Direction.UP
      ? [...above, ...below]
      : [...below, ...above];
  }

  openDoor(): void {
    this.doorState = DoorState.OPEN;
  }

  closeDoor(): void {
    this.doorState = DoorState.CLOSED;
  }

  setCurrentFloor(currentFloor: number): void {
    this.currentFloor = currentFloor;
  }

  getCurrentFloor(): number {
    return this.currentFloor;
  }

  moveToUpperFloor(): void {
    this.setCurrentFloor(this.currentFloor + 1);
  }

  moveToLowerFloor(): void {
    this.setCurrentFloor(this.currentFloor - 1);
  }

  moveToNextStop(): ElevatorCall[] {
    if (this.stops.length === 0 || this.direction === Direction.IDLE) {
      return [];
    }

    this.closeDoor();

    if (this.direction === Direction.UP) {
      this.moveToUpperFloor();
    } else {
      this.moveToLowerFloor();
    }

    const arrivedFloor = this.currentFloor;

    if (this.stops.includes(arrivedFloor)) {
      this.openDoor();
      const completedCalls = this.removeStop(arrivedFloor);

      if (this.assignedCalls.length === 0) {
        this.direction = Direction.IDLE;
        return completedCalls;
      }

      this.direction = this.getDirectionToFloor(this.stops[0]);
      return completedCalls;
    }

    return [];
  }

  private removeStop(stop: number): ElevatorCall[] {
    const completedCalls = this.assignedCalls.filter(
      (call) => call.getCurrentLocation() === stop,
    );

    completedCalls.forEach((call) => call.finishElevatorCall());

    this.assignedCalls = this.assignedCalls.filter(
      (call) => call.getCurrentLocation() !== stop,
    );

    return completedCalls;
  }

  private getDirectionToFloor(floor: number): Direction {
    if (floor > this.currentFloor) {
      return Direction.UP;
    }

    if (floor < this.currentFloor) {
      return Direction.DOWN;
    }

    return Direction.IDLE;
  }

  finishWaiting(): void {
    this.closeDoor();
  }
}
