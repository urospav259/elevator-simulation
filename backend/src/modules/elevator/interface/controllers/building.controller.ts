import { Body, Controller, Get, Post } from '@nestjs/common';
import { GetBuildingUseCase } from '../../application/use-cases/get-building.use-case';
import { MoveElevatorsUseCase } from '../../application/use-cases/move-elevators.use-case';

@Controller('building')
export class BuildingController {
  constructor(
    private readonly getBuilding: GetBuildingUseCase,
    private readonly moveElevators: MoveElevatorsUseCase,
  ) {}

  @Get()
  getState() {
    return this.getBuilding.execute();
  }

  @Post('tick')
  moveElevatorsTick(@Body('buildingId') buildingId: string) {
    return this.moveElevators.execute(buildingId);
  }
}
