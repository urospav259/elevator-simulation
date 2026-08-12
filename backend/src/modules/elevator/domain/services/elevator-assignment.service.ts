import { Elevator } from '../entities/elevator';
import { ElevatorCall } from '../entities/elevator-call';
import { Direction } from '../types/direction';

export class ElevatorAssignmentService {
  constructor() {}

  private isOnTheWay(
    elevator: Elevator,
    direction: Direction,
    floor: number,
  ): boolean {
    const elevatorDirection = elevator.getDirection();

    if (
      elevatorDirection === Direction.IDLE ||
      elevatorDirection !== direction
    ) {
      return false;
    }

    const currentFloor = elevator.getCurrentFloor();

    return direction === Direction.UP
      ? floor > currentFloor
      : floor < currentFloor;
  }

  private getDistance(
    elevator: Elevator,
    direction: Direction,
    floor: number,
  ): number {
    const currentFloor = elevator.getCurrentFloor();
    const elevatorDirection = elevator.getDirection();
    const stops = elevator.getStops();

    if (elevatorDirection === Direction.IDLE || stops.length === 0) {
      return Math.abs(floor - currentFloor);
    }

    switch (elevatorDirection) {
      case Direction.UP: {
        if (this.isOnTheWay(elevator, direction, floor)) {
          return floor - currentFloor;
        }

        const highestStop = Math.max(...stops);

        return highestStop - currentFloor + Math.abs(highestStop - floor);
      }

      case Direction.DOWN: {
        if (this.isOnTheWay(elevator, direction, floor)) {
          return currentFloor - floor;
        }

        const lowestStop = Math.min(...stops);

        return currentFloor - lowestStop + Math.abs(floor - lowestStop);
      }

      default:
        return Math.abs(floor - currentFloor);
    }
  }

  getOptimalElevatorForAssignment(
    elevatorCall: ElevatorCall,
    elevators: Elevator[],
  ): Elevator {
    const floor = elevatorCall.getCurrentLocation();
    const direction = elevatorCall.getDirection();

    if (elevators.length === 0) {
      throw new Error('No elevators available for assignment');
    }

    const relevantElevators = elevators.filter(
      (elevator) =>
        this.isOnTheWay(elevator, direction, floor) ||
        elevator.getDirection() === Direction.IDLE,
    );

    const candidates =
      relevantElevators.length > 0 ? relevantElevators : elevators;

    return candidates.reduce((bestElevator, elevator) => {
      const bestDistance = this.getDistance(bestElevator, direction, floor);
      const currentDistance = this.getDistance(elevator, direction, floor);

      return currentDistance < bestDistance ? elevator : bestElevator;
    });
  }
}
