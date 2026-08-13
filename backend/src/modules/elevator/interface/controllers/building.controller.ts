import { Body, Controller, Get, Post, UseFilters } from '@nestjs/common';

import { CreateBuildingDto } from '../dto/create-building.dto';
import { CreateBuildingUseCase } from '../../application/use-cases/create-building.use-case';
import { GetBuildingUseCase } from '../../application/use-cases/get-building.use-case';
import { HttpErrorFilter } from '../filters/http-error.filter';

@UseFilters(HttpErrorFilter)
@Controller('buildings')
export class BuildingController {
  constructor(
    private readonly getBuilding: GetBuildingUseCase,
    private readonly createBuilding: CreateBuildingUseCase,
  ) {}

  @Get()
  list() {
    return this.getBuilding.execute();
  }

  @Post()
  create(@Body() body: CreateBuildingDto) {
    return this.createBuilding.execute(body);
  }
}
