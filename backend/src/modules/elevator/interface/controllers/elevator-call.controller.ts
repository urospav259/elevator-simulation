import { Body, Controller, Post } from '@nestjs/common';
import { ElevatorCallDto } from '../dto/elevator-call.dto';
import { CallElevatorsUseCase } from '../../application/use-cases/call-elevator.use-case';

@Controller('elevator-calls')
export class ElevatorCallController {
  constructor(private readonly callElevator: CallElevatorsUseCase) {}

  @Post()
  createCall(@Body() body: ElevatorCallDto) {
    return this.callElevator.execute(body);
  }
}
