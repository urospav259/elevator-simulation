import { CallStatus } from '../types/call-status';
import { Direction } from '../types/direction';

export class ElevatorCall {
  createdAt: Date | null;
  finishedAt: Date | null;

  private status: CallStatus | null;
  private assignedElevatorId: string | null;

  constructor(
    private readonly id: string,
    private readonly buildingId: string,
    private readonly floor: number,
    private readonly direction: Exclude<Direction, Direction.IDLE>,
  ) {
    this.status = null;
    this.assignedElevatorId = null;
  }

  static restore(params: {
    id: string;
    buildingId: string;
    floor: number;
    direction: Exclude<Direction, Direction.IDLE>;
    status: CallStatus | null;
    assignedElevatorId: string | null;
    createdAt: Date | null;
    finishedAt: Date | null;
  }): ElevatorCall {
    const call = new ElevatorCall(
      params.id,
      params.buildingId,
      params.floor,
      params.direction,
    );

    call.status = params.status;
    call.assignedElevatorId = params.assignedElevatorId;
    call.createdAt = params.createdAt;
    call.finishedAt = params.finishedAt;

    return call;
  }

  assignElevator(elevatorId: string): void {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }

    this.status = CallStatus.ASSIGNED;
    this.assignedElevatorId = elevatorId;
  }

  finishElevatorCall(): void {
    this.finishedAt = new Date();
    this.status = CallStatus.COMPLETED;
  }

  getId(): string {
    return this.id;
  }

  getBuildingId(): string {
    return this.buildingId;
  }

  getCurrentLocation(): number {
    return this.floor;
  }

  getStatus(): CallStatus | null {
    return this.status;
  }

  getAssignedElevatorId(): string | null {
    return this.assignedElevatorId;
  }

  getDirection(): Exclude<Direction, Direction.IDLE> {
    return this.direction;
  }
}
