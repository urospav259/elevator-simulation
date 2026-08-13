import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { BuildingRepository } from '../../application/ports/building.repository';
import { BuildingStateRepository } from '../../application/ports/building-state.repository';
import { Building } from '../../domain/entities/building';
import { Elevator } from '../../domain/entities/elevator';
import { ElevatorCall } from '../../domain/entities/elevator-call';
import { BuildingState } from '../../domain/types/building-state';
import { CallStatus } from '../../domain/types/call-status';
import { BuildingOrmEntity } from './typeorm/building.orm-entity';
import { ElevatorCallOrmEntity } from './typeorm/elevator-call.orm-entity';
import { ElevatorOrmEntity } from './typeorm/elevator.orm-entity';

@Injectable()
export class PostgresBuildingRepository
  implements BuildingRepository, BuildingStateRepository
{
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(BuildingOrmEntity)
    private readonly buildings: Repository<BuildingOrmEntity>,
    @InjectRepository(ElevatorOrmEntity)
    private readonly elevators: Repository<ElevatorOrmEntity>,
    @InjectRepository(ElevatorCallOrmEntity)
    private readonly calls: Repository<ElevatorCallOrmEntity>,
  ) {}

  async findById(id: string): Promise<Building | null> {
    const building = await this.buildings.findOne({
      where: { id },
      relations: { elevators: true },
      order: { elevators: { id: 'ASC' } },
    });

    return building ? this.toDomain(building) : null;
  }

  async list(): Promise<Building[]> {
    const buildings = await this.buildings.find({
      relations: { elevators: true },
      order: { createdAt: 'ASC', elevators: { id: 'ASC' } },
    });

    return buildings.map((building) => this.toDomain(building));
  }

  async save(building: Building): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.save(BuildingOrmEntity, {
        id: building.getId(),
        name: building.getName(),
        floorsCount: building.getNumberOfFloors(),
        createdAt: new Date(),
      });

      await manager.save(
        ElevatorOrmEntity,
        building.getElevators().map((elevator) => ({
          id: elevator.getId(),
          buildingId: building.getId(),
          currentFloor: elevator.getCurrentFloor(),
          direction: elevator.getDirection(),
          doorState: elevator.getDoorState(),
        })),
      );
    });
  }

  async getBuildingData(buildingId: string): Promise<BuildingState> {
    const building = await this.buildings.findOne({ where: { id: buildingId } });

    if (!building) {
      throw new Error('Building not found');
    }

    const elevators = await this.elevators.find({
      where: { buildingId },
      order: { id: 'ASC' },
    });

    const callsByElevator = await this.findAssignedCalls(
      elevators.map((elevator) => elevator.id),
    );

    return {
      buildingId: building.id,
      floors: building.floorsCount,
      elevators: elevators.map((elevator) =>
        this.elevatorToDomain(elevator, callsByElevator),
      ),
    };
  }

  private async findAssignedCalls(
    elevatorIds: string[],
  ): Promise<Map<string, ElevatorCall[]>> {
    const callsByElevator = new Map<string, ElevatorCall[]>();

    if (elevatorIds.length === 0) {
      return callsByElevator;
    }

    const calls = await this.calls.find({
      where: {
        assignedElevatorId: In(elevatorIds),
        status: CallStatus.ASSIGNED,
      },
      order: { createdAt: 'ASC' },
    });

    calls.forEach((call) => {
      if (!call.assignedElevatorId) {
        return;
      }

      const elevatorCalls = callsByElevator.get(call.assignedElevatorId) ?? [];
      elevatorCalls.push(this.callToDomain(call));
      callsByElevator.set(call.assignedElevatorId, elevatorCalls);
    });

    return callsByElevator;
  }

  private toDomain(building: BuildingOrmEntity): Building {
    const elevators = (building.elevators ?? []).map((elevator) =>
      this.elevatorToDomain(elevator, new Map()),
    );

    return new Building(
      building.id,
      building.name,
      building.floorsCount,
      elevators,
    );
  }

  private elevatorToDomain(
    elevator: ElevatorOrmEntity,
    callsByElevator: Map<string, ElevatorCall[]>,
  ): Elevator {
    return new Elevator(
      elevator.id,
      elevator.currentFloor,
      elevator.direction,
      elevator.doorState,
      elevator.buildingId,
      callsByElevator.get(elevator.id) ?? [],
    );
  }

  private callToDomain(call: ElevatorCallOrmEntity): ElevatorCall {
    return ElevatorCall.restore({
      id: call.id,
      buildingId: call.buildingId,
      floor: call.floor,
      direction: call.direction,
      status: call.status,
      assignedElevatorId: call.assignedElevatorId,
      createdAt: call.createdAt,
      finishedAt: call.finishedAt,
    });
  }
}
