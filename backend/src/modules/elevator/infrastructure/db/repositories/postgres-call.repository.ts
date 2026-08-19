import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ElevatorCallRepository } from '../../../application/ports/elevator-call.repository';
import { ElevatorCall } from '../../../domain/entities/elevator-call';
import { ElevatorCallOrmEntity } from '../typeorm/elevator-call.orm-entity';

@Injectable()
export class PostgresCallRepository implements ElevatorCallRepository {
  constructor(
    @InjectRepository(ElevatorCallOrmEntity)
    private readonly calls: Repository<ElevatorCallOrmEntity>,
  ) {}

  async findById(id: string): Promise<ElevatorCall | null> {
    const call = await this.calls.findOne({ where: { id } });

    return call ? this.toDomain(call) : null;
  }

  async save(call: ElevatorCall): Promise<void> {
    await this.calls.save({
      id: call.getId(),
      buildingId: call.getBuildingId(),
      floor: call.getCurrentLocation(),
      direction: call.getDirection(),
      status: call.getStatus(),
      assignedElevatorId: call.getAssignedElevatorId(),
      createdAt: call.createdAt,
      finishedAt: call.finishedAt,
    });
  }

  private toDomain(call: ElevatorCallOrmEntity): ElevatorCall {
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
