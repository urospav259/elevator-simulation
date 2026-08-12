import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ElevatorRepository } from '../../application/ports/elevator.repository';
import { Elevator } from '../../domain/entities/elevator';
import { ElevatorOrmEntity } from './typeorm/elevator.orm-entity';

@Injectable()
export class PostgresElevatorRepository implements ElevatorRepository {
  constructor(
    @InjectRepository(ElevatorOrmEntity)
    private readonly elevators: Repository<ElevatorOrmEntity>,
  ) {}

  async findById(id: string): Promise<Elevator | null> {
    const elevator = await this.elevators.findOne({ where: { id } });

    return elevator ? this.toDomain(elevator) : null;
  }

  async list(): Promise<Elevator[]> {
    const elevators = await this.elevators.find({ order: { id: 'ASC' } });

    return elevators.map((elevator) => this.toDomain(elevator));
  }

  async save(elevator: Elevator): Promise<void> {
    await this.elevators.save({
      id: elevator.getId(),
      currentFloor: elevator.getCurrentFloor(),
      direction: elevator.getDirection(),
      doorState: elevator.getDoorState(),
    });
  }

  private toDomain(elevator: ElevatorOrmEntity): Elevator {
    return new Elevator(
      elevator.id,
      elevator.currentFloor,
      elevator.direction,
      elevator.doorState,
    );
  }
}
