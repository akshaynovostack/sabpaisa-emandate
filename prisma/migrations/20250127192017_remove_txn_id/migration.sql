/*
  Warnings:

  - You are about to drop the column `txn_id` on the `transaction` table. All the data in the column will be lost.
  - Added the required column `amount` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transaction` DROP COLUMN `txn_id`,
    ADD COLUMN `amount` DECIMAL(65, 30) NOT NULL;
