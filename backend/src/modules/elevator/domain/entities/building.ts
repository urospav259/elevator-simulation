import { Elevator } from './elevator';

export class Building {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly numberOfFloors: number,
    private elevators: Elevator[],
  ) {
    if (!name.trim()) {
      throw new Error('Building name is required');
    }

    if (
      numberOfFloors <= 0 ||
      !Number.isInteger(numberOfFloors) ||
      numberOfFloors > 30
    ) {
      throw new Error(
        'Number of floors must be greater than 0 and lower than or equal to 30',
      );
    }

    if (elevators.length <= 0 || elevators.length > 10) {
      throw new Error(
        'There must be between 1 and 10 elevators in the building',
      );
    }
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getNumberOfFloors(): number {
    return this.numberOfFloors;
  }

  setElevators(elevators: Elevator[]): void {
    if (elevators.length <= 0 || elevators.length > 10) {
      throw new Error(
        'There must be between 1 and 10 elevators in the building',
      );
    }

    this.elevators = elevators;
  }

  getElevators(): Elevator[] {
    return this.elevators;
  }
}
