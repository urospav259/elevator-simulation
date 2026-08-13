import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { ElevatorOrmEntity } from './elevator.orm-entity';

@Entity('buildings')
export class BuildingOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ name: 'floors_count', type: 'integer' })
  floorsCount: number;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => ElevatorOrmEntity, (elevator) => elevator.building)
  elevators: ElevatorOrmEntity[];
}
