import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInitialElevators20260812000100 implements MigrationInterface {
  name = 'SeedInitialElevators20260812000100';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO elevators (id, current_floor, direction, door_state)
      VALUES
        ('elevator-1', 0, 'IDLE', 'CLOSED'),
        ('elevator-2', 4, 'IDLE', 'CLOSED'),
        ('elevator-3', 8, 'IDLE', 'CLOSED')
      ON CONFLICT (id) DO NOTHING
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM elevators
      WHERE id IN ('elevator-1', 'elevator-2', 'elevator-3')
    `);
  }
}
