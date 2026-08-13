import { Direction } from '../../domain/types/direction';

export interface ElevatorCallDto {
  buildingId: string;
  floor: number;
  direction: Exclude<Direction, Direction.IDLE>;
}
