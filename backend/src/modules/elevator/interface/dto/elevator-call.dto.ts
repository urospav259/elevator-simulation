import { Direction } from '../../domain/types/direction';

export class ElevatorCallDto {
  floor: number;
  direction: Exclude<Direction, Direction.IDLE>;
}
