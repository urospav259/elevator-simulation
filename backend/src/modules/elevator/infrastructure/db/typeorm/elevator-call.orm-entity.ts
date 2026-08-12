import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { CallStatus } from '../../../domain/types/call-status';
import { Direction } from '../../../domain/types/direction';
import { ElevatorOrmEntity } from './elevator.orm-entity';

@Entity('elevator_calls')
export class ElevatorCallOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'integer' })
  floor: number;

  @Column({
    type: 'enum',
    enum: Direction,
    enumName: 'elevator_call_direction',
  })
  direction: Exclude<Direction, Direction.IDLE>;

  @Column({
    type: 'enum',
    enum: CallStatus,
    enumName: 'elevator_call_status',
    nullable: true,
  })
  status: CallStatus | null;

  @Column({ name: 'assigned_elevator_id', type: 'varchar', length: 64, nullable: true })
  assignedElevatorId: string | null;

  @ManyToOne(() => ElevatorOrmEntity, (elevator) => elevator.calls, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assigned_elevator_id' })
  assignedElevator: ElevatorOrmEntity | null;

  @Column({ name: 'created_at', type: 'timestamptz', nullable: true })
  createdAt: Date | null;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt: Date | null;
}
