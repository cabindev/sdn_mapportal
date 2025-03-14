-- AlterTable
ALTER TABLE `Document` ADD COLUMN `year` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Document_year_idx` ON `Document`(`year`);
