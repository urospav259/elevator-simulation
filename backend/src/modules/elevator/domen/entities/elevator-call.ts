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

  public getCurrentLocation(): number {
    return this.floor;
  }

  public getDirection(): Direction {
    return this.direction;
  }
}
