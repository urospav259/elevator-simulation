import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { BUILDING_REPOSITORY } from './application/ports/building.repository';
import { BUILDING_STATE_PUBLISHER } from './application/ports/building-state.publisher';
import { BUILDING_STATE_REPOSITORY } from './application/ports/building-state.repository';
import { ELEVATOR_CALL_REPOSITORY } from './application/ports/elevator-call.repository';
import { ELEVATOR_REPOSITORY } from './application/ports/elevator.repository';
import { CallElevatorsUseCase } from './application/use-cases/call-elevator.use-case';
import { CreateBuildingUseCase } from './application/use-cases/create-building.use-case';
import { GetActiveBuildingIdsUseCase } from './application/use-cases/get-active-building-ids.use-case';
import { GetBuildingStateUseCase } from './application/use-cases/get-building-state.use-case';
import { GetBuildingUseCase } from './application/use-cases/get-building.use-case';
import { MoveElevatorsUseCase } from './application/use-cases/move-elevators.use-case';
import { PickDestinationUseCase } from './application/use-cases/pick-destination.use-case';
import { ElevatorAssignmentService } from './domain/services/elevator-assignment.service';
import { ElevatorTypeOrmModule } from './infrastructure/db/typeorm.module';
import { PostgresBuildingRepository } from './infrastructure/db/postgres-building.repository';
import { PostgresCallRepository } from './infrastructure/db/postgres-call.repository';
import { PostgresElevatorRepository } from './infrastructure/db/postgres-elevator.repository';
import { ElevatorSimulationTicker } from './infrastructure/simulation/elevator-simulation.ticker';
import { SseBuildingStatePublisher } from './infrastructure/simulation/sse-building-state.publisher';
import { BuildingController } from './interface/controllers/building.controller';
import { BuildingStateController } from './interface/controllers/building-state.controller';
import { ElevatorCallController } from './interface/controllers/elevator-call.controller';

@Module({
  imports: [ScheduleModule.forRoot(), ElevatorTypeOrmModule],
  controllers: [
    BuildingController,
    BuildingStateController,
    ElevatorCallController,
  ],
  providers: [
    ElevatorAssignmentService,
    PostgresBuildingRepository,
    PostgresElevatorRepository,
    PostgresCallRepository,
    SseBuildingStatePublisher,
    ElevatorSimulationTicker,
    { provide: BUILDING_REPOSITORY, useExisting: PostgresBuildingRepository },
    {
      provide: BUILDING_STATE_REPOSITORY,
      useExisting: PostgresBuildingRepository,
    },
    { provide: ELEVATOR_REPOSITORY, useExisting: PostgresElevatorRepository },
    { provide: ELEVATOR_CALL_REPOSITORY, useExisting: PostgresCallRepository },
    {
      provide: BUILDING_STATE_PUBLISHER,
      useExisting: SseBuildingStatePublisher,
    },
    {
      provide: CreateBuildingUseCase,
      useFactory: (buildingRepository) =>
        new CreateBuildingUseCase(buildingRepository),
      inject: [BUILDING_REPOSITORY],
    },
    {
      provide: GetActiveBuildingIdsUseCase,
      useFactory: (buildingRepository) =>
        new GetActiveBuildingIdsUseCase(buildingRepository),
      inject: [BUILDING_REPOSITORY],
    },
    {
      provide: GetBuildingUseCase,
      useFactory: (buildingRepository) =>
        new GetBuildingUseCase(buildingRepository),
      inject: [BUILDING_REPOSITORY],
    },
    {
      provide: GetBuildingStateUseCase,
      useFactory: (buildingStateRepository) =>
        new GetBuildingStateUseCase(buildingStateRepository),
      inject: [BUILDING_STATE_REPOSITORY],
    },
    {
      provide: MoveElevatorsUseCase,
      useFactory: (elevatorRepository, elevatorCallRepository, publisher) =>
        new MoveElevatorsUseCase(
          elevatorRepository,
          elevatorCallRepository,
          publisher,
        ),
      inject: [
        ELEVATOR_REPOSITORY,
        ELEVATOR_CALL_REPOSITORY,
        BUILDING_STATE_PUBLISHER,
      ],
    },
    {
      provide: CallElevatorsUseCase,
      useFactory: (
        elevatorRepository,
        elevatorCallRepository,
        publisher,
        elevatorAssignmentService,
      ) =>
        new CallElevatorsUseCase(
          elevatorRepository,
          elevatorCallRepository,
          publisher,
          elevatorAssignmentService,
        ),
      inject: [
        ELEVATOR_REPOSITORY,
        ELEVATOR_CALL_REPOSITORY,
        BUILDING_STATE_PUBLISHER,
        ElevatorAssignmentService,
      ],
    },
    {
      provide: PickDestinationUseCase,
      useFactory: (elevatorRepository, elevatorCallRepository, publisher) =>
        new PickDestinationUseCase(
          elevatorRepository,
          elevatorCallRepository,
          publisher,
        ),
      inject: [
        ELEVATOR_REPOSITORY,
        ELEVATOR_CALL_REPOSITORY,
        BUILDING_STATE_PUBLISHER,
      ],
    },
  ],
})
export class ElevatorModule {}
