import type { MigrationInterface, QueryRunner } from 'typeorm';

export class second1611159105526 implements MigrationInterface {
  name = 'second1611159105526';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `dumb` (`name` varchar(255) NOT NULL) ENGINE=InnoDB',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `dumb`');
  }
}
