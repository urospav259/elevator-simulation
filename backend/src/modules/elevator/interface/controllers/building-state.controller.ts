import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MoveElevatorsUseCase } from '../../application/use-cases/move-elevators.use-case';
import { GetBuildingStateUseCase } from '../../application/use-cases/get-building-state.use-case';

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
