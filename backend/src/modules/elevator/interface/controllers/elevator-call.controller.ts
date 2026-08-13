import { Body, Controller, Post, UseFilters } from '@nestjs/common';

import { ElevatorCallDto } from '../dto/elevator-call.dto';
import { ElevatorDestinationDto } from '../dto/elevator-destination.dto';
import { CallElevatorsUseCase } from '../../application/use-cases/call-elevator.use-case';
import { PickDestinationUseCase } from '../../application/use-cases/pick-destination.use-case';
import { HttpErrorFilter } from '../filters/http-error.filter';

@UseFilters(HttpErrorFilter)
@Controller('elevator-calls')
export class ElevatorCallController {
  constructor(
    private readonly callElevator: CallElevatorsUseCase,
    private readonly pickDestination: PickDestinationUseCase,
  ) {}

  @Post()
  createCall(@Body() body: ElevatorCallDto) {
    return this.callElevator.execute(body);
  }

  @Post('pick-destination')
  chooseDestination(@Body() body: ElevatorDestinationDto) {
    return this.pickDestination.execute(body);
  }
}
