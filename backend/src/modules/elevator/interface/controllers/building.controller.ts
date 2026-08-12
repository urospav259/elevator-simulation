import { Controller, Get, Post } from '@nestjs/common';
import { MoveElevatorsUseCase } from '../../application/use-cases/move-elevators.use-case';
import { GetBuildingStateUseCase } from '../../application/use-cases/get-building-state.use-case';

@Controller('building')
export class BuildingController {
  constructor(
    private readonly getBuildingState: GetBuildingStateUseCase,
    private readonly moveElevators: MoveElevatorsUseCase,
  ) {}

  @Get()
  getState() {
    return this.getBuildingState.execute();
  }

  @Post('tick')
  moveElevatorsTick() {
    return this.moveElevators.execute();
  }
}
