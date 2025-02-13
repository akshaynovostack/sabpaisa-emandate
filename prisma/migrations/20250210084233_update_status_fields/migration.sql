/*
  Warnings:

  - You are about to alter the column `status` on the `merchant` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `TinyInt`.
  - You are about to alter the column `status` on the `merchant_slab` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `TinyInt`.
  - You are about to drop the column `client_transaction_id` on the `transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `merchant` MODIFY `status` TINYINT NULL;

-- AlterTable
ALTER TABLE `merchant_slab` MODIFY `status` TINYINT NULL;
