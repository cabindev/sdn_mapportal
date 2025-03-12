-- AlterTable
ALTER TABLE `Document` ADD COLUMN `zone` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Document_zone_idx` ON `Document`(`zone`);
