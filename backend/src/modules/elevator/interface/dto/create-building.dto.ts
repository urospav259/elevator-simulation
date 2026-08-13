import { Type } from 'class-transformer';
import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateBuildingDto {
  @IsString()
  @MinLength(1)
  name: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  floors: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  elevators: number;
}
