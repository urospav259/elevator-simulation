import {
  Body,
  Controller,
  Get,
  MessageEvent,
  Param,
  Post,
  Sse,
  UseFilters,
} from '@nestjs/common';
import { concat, from, map, Observable } from 'rxjs';

import { GetBuildingStateUseCase } from '../../application/use-cases/get-building-state.use-case';
import { MoveElevatorsUseCase } from '../../application/use-cases/move-elevators.use-case';
import { SseBuildingStatePublisher } from '../../infrastructure/simulation/sse-building-state.publisher';
import { HttpErrorFilter } from '../filters/http-error.filter';

@UseFilters(HttpErrorFilter)
@Controller('building-state')
export class BuildingStateController {
  constructor(
    private readonly getBuildingState: GetBuildingStateUseCase,
    private readonly moveElevators: MoveElevatorsUseCase,
    private readonly buildingStateEvents: SseBuildingStatePublisher,
  ) {}

  @Get(':buildingId')
  getState(@Param('buildingId') buildingId: string) {
    return this.getBuildingState.execute(buildingId);
  }

  @Sse(':buildingId/events')
  streamState(
    @Param('buildingId') buildingId: string,
  ): Observable<MessageEvent> {
    const initialState = from(this.getBuildingState.execute(buildingId)).pipe(
      map((state) => ({
        type: 'building-state',
        data: state,
      })),
    );

    return concat(initialState, this.buildingStateEvents.stream(buildingId));
  }

  @Post('tick')
  moveElevatorsTick(@Body('buildingId') buildingId: string) {
    return this.moveElevators.execute(buildingId);
  }
}
