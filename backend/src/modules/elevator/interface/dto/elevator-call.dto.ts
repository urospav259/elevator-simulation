import { Type } from 'class-transformer';
import { IsIn, IsInt, IsUUID, Max, Min } from 'class-validator';

import { Direction } from '../../domain/types/direction';

export class ElevatorCallDto {
  @IsUUID()
  buildingId: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  floor: number;

  @IsIn([Direction.UP, Direction.DOWN])
  direction: Exclude<Direction, Direction.IDLE>;
}
