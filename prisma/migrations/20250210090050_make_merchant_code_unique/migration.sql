/*
  Warnings:

  - A unique constraint covering the columns `[merchant_code]` on the table `merchant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `merchant_merchant_code_key` ON `merchant`(`merchant_code`);
