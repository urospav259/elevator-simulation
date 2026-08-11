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
  ) {
    this.assignedCalls = [];
  }

  addStop(call: ElevatorCall) {
    this.assignedCalls.push(call);
  }

  resetStops() {
    this.assignedCalls = [];
  }

  getAssignedCalls() {
    return this.assignedCalls;
  }

  getDirection(): Direction {
    return this.direction;
  }

  get stops(): number[] {
    return this.getStops();
  }

  getStops(): number[] {
    const allStops = this.assignedCalls.map((call: ElevatorCall) =>
      call.getCurrentLocation(),
    );

    return this.getOrderedStops(allStops);
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

  public moveToNextStop() {
    if (this.stops.length === 0 || this.direction === Direction.IDLE) {
      return;
    }

    const currentStop = this.currentFloor;

    if (this.direction === Direction.UP) {
      this.moveToUpperFloor();
    } else {
      return this.moveToLowerFloor();
    }

    if (this.stops.includes(currentStop)) {
      this.openDoor();
    }

    this.removeStop(currentStop);
  }

  private removeStop(stop: number) {
    this.assignedCalls.filter((call) => call.getCurrentLocation() === stop);
    if (this.assignedCalls.length === 0) {
      this.direction = Direction.IDLE;
    }
  }

  finishWaiting() {
    this.closeDoor();
  }
}
