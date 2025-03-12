/*
  Warnings:

  - You are about to drop the column `type` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `zone` on the `Document` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Document_zone_idx` ON `Document`;

-- AlterTable
ALTER TABLE `Document` DROP COLUMN `type`,
    DROP COLUMN `zone`;
