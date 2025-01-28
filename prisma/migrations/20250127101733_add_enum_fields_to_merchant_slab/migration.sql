/*
  Warnings:

  - You are about to alter the column `frequency` on the `merchant_slab` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Enum(EnumId(0))`.
  - Added the required column `mandate_category` to the `merchant_slab` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `merchant_slab` ADD COLUMN `mandate_category` ENUM('U005', 'B001', 'A001', 'D001', 'I002', 'L002', 'E001', 'I001', 'L001', 'M001', 'F001', 'U099', 'T002', 'T001', 'U001', 'U003', 'U006') NOT NULL,
    MODIFY `frequency` ENUM('ADHO', 'DAIL', 'WEEK', 'MNTH', 'QURT', 'MIAN', 'YEAR', 'BIMN', 'OOFF', 'RCUR') NOT NULL;
