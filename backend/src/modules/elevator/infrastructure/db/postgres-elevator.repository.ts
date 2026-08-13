import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ElevatorRepository } from '../../application/ports/elevator.repository';
import { Elevator } from '../../domain/entities/elevator';
import { ElevatorCall } from '../../domain/entities/elevator-call';
import { CallStatus } from '../../domain/types/call-status';
import { ElevatorOrmEntity } from './typeorm/elevator.orm-entity';
import { ElevatorCallOrmEntity } from './typeorm/elevator-call.orm-entity';

@Injectable()
export class PostgresElevatorRepository implements ElevatorRepository {
  constructor(
    @InjectRepository(ElevatorOrmEntity)
    private readonly elevators: Repository<ElevatorOrmEntity>,
    @InjectRepository(ElevatorCallOrmEntity)
    private readonly calls: Repository<ElevatorCallOrmEntity>,
  ) {}

  async findById(id: string): Promise<Elevator | null> {
    const elevator = await this.elevators.findOne({ where: { id } });

    if (!elevator) {
      return null;
    }

    return this.toDomain(elevator, await this.findAssignedCalls([id]));
  }

  async list(buildingId: string): Promise<Elevator[]> {
    const elevators = await this.elevators.find({
      where: { buildingId },
      order: { id: 'ASC' },
    });

    const callsByElevator = await this.findAssignedCalls(
      elevators.map((elevator) => elevator.id),
    );

    return elevators.map((elevator) => this.toDomain(elevator, callsByElevator));
  }

  async save(elevator: Elevator): Promise<void> {
    await this.elevators.save({
      id: elevator.getId(),
      buildingId: elevator.getBuildingId(),
      currentFloor: elevator.getCurrentFloor(),
      direction: elevator.getDirection(),
      doorState: elevator.getDoorState(),
    });
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

  private toDomain(
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
