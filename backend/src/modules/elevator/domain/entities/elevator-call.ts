import { CallStatus } from '../types/call-status';
import { Direction } from '../types/direction';

export class ElevatorCall {
  createdAt: Date | null;
  finishedAt: Date | null;

  private status: CallStatus | null;
  private assignedElevatorId: string | null;

  constructor(
    private readonly id: string,
    private readonly floor: number,
    private readonly direction: Exclude<Direction, Direction.IDLE>,
  ) {
    this.status = null;
    this.assignedElevatorId = null;
  }

  static restore(params: {
    id: string;
    floor: number;
    direction: Exclude<Direction, Direction.IDLE>;
    status: CallStatus | null;
    assignedElevatorId: string | null;
    createdAt: Date | null;
    finishedAt: Date | null;
  }): ElevatorCall {
    const call = new ElevatorCall(params.id, params.floor, params.direction);

    call.status = params.status;
    call.assignedElevatorId = params.assignedElevatorId;
    call.createdAt = params.createdAt;
    call.finishedAt = params.finishedAt;

    return call;
  }

  assignElevator(elevatorId: string) {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }

    this.status = CallStatus.ASSIGNED;
    this.assignedElevatorId = elevatorId;
  }

  finishElevatorCall() {
    this.finishedAt = new Date();
    this.status = CallStatus.COMPLETED;
  }

  public getId(): string {
    return this.id;
  }

  public getCurrentLocation(): number {
    return this.floor;
  }

  public getStatus(): CallStatus | null {
    return this.status;
  }

  public getAssignedElevatorId(): string | null {
    return this.assignedElevatorId;
  }

  public getDirection(): Direction {
    return this.direction;
  }
}
