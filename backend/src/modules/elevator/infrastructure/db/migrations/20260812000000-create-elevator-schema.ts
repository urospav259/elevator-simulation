import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateElevatorSchema20260812000000 implements MigrationInterface {
  name = 'CreateElevatorSchema20260812000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE elevator_direction AS ENUM ('UP', 'DOWN', 'IDLE')
    `);

    await queryRunner.query(`
      CREATE TYPE elevator_door_state AS ENUM ('OPEN', 'CLOSED')
    `);

    await queryRunner.query(`
      CREATE TYPE elevator_call_direction AS ENUM ('UP', 'DOWN')
    `);

    await queryRunner.query(`
      CREATE TYPE elevator_call_status AS ENUM ('ASSIGNED', 'COMPLETED')
    `);

    await queryRunner.query(`
      CREATE TABLE elevators (
        id varchar(64) PRIMARY KEY,
        current_floor integer NOT NULL,
        direction elevator_direction NOT NULL DEFAULT 'IDLE',
        door_state elevator_door_state NOT NULL DEFAULT 'CLOSED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE elevator_calls (
        id uuid PRIMARY KEY,
        floor integer NOT NULL,
        direction elevator_call_direction NOT NULL,
        status elevator_call_status,
        assigned_elevator_id varchar(64),
        created_at timestamptz,
        finished_at timestamptz,
        CONSTRAINT fk_elevator_calls_assigned_elevator
          FOREIGN KEY (assigned_elevator_id)
          REFERENCES elevators(id)
          ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX idx_elevator_calls_status
      ON elevator_calls(status)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_elevator_calls_assigned_elevator_id
      ON elevator_calls(assigned_elevator_id)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_elevator_calls_created_at
      ON elevator_calls(created_at)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_elevator_calls_created_at');
    await queryRunner.query('DROP INDEX IF EXISTS idx_elevator_calls_assigned_elevator_id');
    await queryRunner.query('DROP INDEX IF EXISTS idx_elevator_calls_status');
    await queryRunner.query('DROP TABLE IF EXISTS elevator_calls');
    await queryRunner.query('DROP TABLE IF EXISTS elevators');
    await queryRunner.query('DROP TYPE IF EXISTS elevator_call_status');
    await queryRunner.query('DROP TYPE IF EXISTS elevator_call_direction');
    await queryRunner.query('DROP TYPE IF EXISTS elevator_door_state');
    await queryRunner.query('DROP TYPE IF EXISTS elevator_direction');
  }
}
