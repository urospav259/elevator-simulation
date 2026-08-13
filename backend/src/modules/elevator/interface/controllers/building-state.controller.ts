import { Body, Controller, Get, Param, Post, UseFilters } from '@nestjs/common';

import { GetBuildingStateUseCase } from '../../application/use-cases/get-building-state.use-case';
import { MoveElevatorsUseCase } from '../../application/use-cases/move-elevators.use-case';
import { HttpErrorFilter } from '../filters/http-error.filter';

@UseFilters(HttpErrorFilter)
@Controller('building-state')
export class BuildingStateController {
  constructor(
    private readonly getBuildingState: GetBuildingStateUseCase,
    private readonly moveElevators: MoveElevatorsUseCase,
  ) {}

  @Get(':buildingId')
  getState(@Param('buildingId') buildingId: string) {
    return this.getBuildingState.execute(buildingId);
  }

  @Post('tick')
  moveElevatorsTick(@Body('buildingId') buildingId: string) {
    return this.moveElevators.execute(buildingId);
  }
}
