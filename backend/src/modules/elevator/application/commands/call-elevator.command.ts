import { Direction } from '../../domain/types/direction';

export type CallElevatorCommand = {
  buildingId: string;
  floor: number;
  direction: Exclude<Direction, Direction.IDLE>;
};
