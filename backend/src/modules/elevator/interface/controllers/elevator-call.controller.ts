import { Body, Controller, Post } from '@nestjs/common';
import { ElevatorCallDto } from '../../application/dto/elevator-call.dto';
import { CallElevatorsUseCase } from '../../application/use-cases/call-elevator.use-case';
import { ElevatorDestinationDto } from '../../application/dto/elevator-destination.dto';
import { PickDestinationUseCase } from '../../application/use-cases/pick-destination.use-case';

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
