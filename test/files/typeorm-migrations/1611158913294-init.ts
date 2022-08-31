import type { MigrationInterface, QueryRunner } from 'typeorm';

export class init1611158913294 implements MigrationInterface {
  name = 'init1611158913294';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `users` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE now(), UNIQUE INDEX `IDX_baaa7064e83f5e9298ea2fcd54` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );

    await queryRunner.query(
      'CREATE TABLE `books` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE now(), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `users`');
    await queryRunner.query('DROP TABLE `books`');
  }
}
