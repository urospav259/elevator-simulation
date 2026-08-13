import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

import { Direction } from '../../../domain/types/direction';
import { DoorState } from '../../../domain/types/door-state';
import { BuildingOrmEntity } from './building.orm-entity';
import { ElevatorCallOrmEntity } from './elevator-call.orm-entity';

@Entity('elevators')
export class ElevatorOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'building_id', type: 'uuid' })
  buildingId: string;

  @ManyToOne(() => BuildingOrmEntity, (building) => building.elevators, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'building_id' })
  building: BuildingOrmEntity;

  @Column({ name: 'current_floor', type: 'integer' })
  currentFloor: number;

  @Column({
    type: 'enum',
    enum: Direction,
    enumName: 'elevator_direction',
    default: Direction.IDLE,
  })
  direction: Direction;

  @Column({
    name: 'door_state',
    type: 'enum',
    enum: DoorState,
    enumName: 'elevator_door_state',
    default: DoorState.CLOSED,
  })
  doorState: DoorState;

  @OneToMany(() => ElevatorCallOrmEntity, (call) => call.assignedElevator)
  calls: ElevatorCallOrmEntity[];
}
