import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInitialElevators20260812000100 implements MigrationInterface {
  name = 'SeedInitialElevators20260812000100';

  private readonly buildingId = '00000000-0000-4000-8000-000000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO buildings (id, name, floors_count)
      VALUES ($1, 'Default building', 10)
      ON CONFLICT (id) DO NOTHING
    `, [this.buildingId]);

    await queryRunner.query(`
      INSERT INTO elevators (id, building_id, current_floor, direction, door_state)
      VALUES
        ('00000000-0000-4000-8000-000000000101', $1, 1, 'IDLE', 'CLOSED'),
        ('00000000-0000-4000-8000-000000000102', $1, 4, 'IDLE', 'CLOSED'),
        ('00000000-0000-4000-8000-000000000103', $1, 8, 'IDLE', 'CLOSED')
      ON CONFLICT (id) DO NOTHING
    `, [this.buildingId]);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM buildings
      WHERE id = $1
    `, [this.buildingId]);
  }
}
