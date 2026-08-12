import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { Direction } from '../../../domain/types/direction';
import { DoorState } from '../../../domain/types/door-state';
import { ElevatorCallOrmEntity } from './elevator-call.orm-entity';

@Entity('elevators')
export class ElevatorOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string;

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
