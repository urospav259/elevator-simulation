import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ElevatorModule } from './modules/elevator/elevator.module';

@Module({
  imports: [ElevatorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
