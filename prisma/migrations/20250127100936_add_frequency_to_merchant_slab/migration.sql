/*
  Warnings:

  - Added the required column `frequency` to the `merchant_slab` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `merchant_slab` ADD COLUMN `frequency` INTEGER NOT NULL;
