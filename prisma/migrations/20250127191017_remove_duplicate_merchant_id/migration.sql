-- DropForeignKey
ALTER TABLE `merchant_slab` DROP FOREIGN KEY `merchant_slab_merchant_id_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `transaction_merchant_id_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `transaction_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_mandate` DROP FOREIGN KEY `user_mandate_transaction_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_mandate` DROP FOREIGN KEY `user_mandate_user_id_fkey`;

-- DropIndex
DROP INDEX `merchant_slab_merchant_id_fkey` ON `merchant_slab`;

-- DropIndex
DROP INDEX `transaction_merchant_id_fkey` ON `transaction`;

-- DropIndex
DROP INDEX `transaction_user_id_fkey` ON `transaction`;

-- DropIndex
DROP INDEX `user_mandate_transaction_id_fkey` ON `user_mandate`;

-- DropIndex
DROP INDEX `user_mandate_user_id_fkey` ON `user_mandate`;

-- AlterTable
ALTER TABLE `merchant` MODIFY `merchant_id` VARCHAR(191) NULL,
    MODIFY `name` VARCHAR(191) NULL,
    MODIFY `token` VARCHAR(191) NULL,
    MODIFY `merchant_code` VARCHAR(191) NULL,
    MODIFY `address` VARCHAR(191) NULL,
    MODIFY `status` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `merchant_slab` ADD COLUMN `duration` INTEGER NULL,
    MODIFY `merchant_id` VARCHAR(191) NULL,
    MODIFY `slab_from` DECIMAL(65, 30) NULL,
    MODIFY `slab_to` DECIMAL(65, 30) NULL,
    MODIFY `base_amount` DECIMAL(65, 30) NULL,
    MODIFY `emi_amount` DECIMAL(65, 30) NULL,
    MODIFY `emi_tenure` INTEGER NULL,
    MODIFY `processing_fee` DECIMAL(65, 30) NULL,
    MODIFY `effective_date` DATETIME(3) NULL,
    MODIFY `expiry_date` DATETIME(3) NULL,
    MODIFY `remarks` VARCHAR(191) NULL,
    MODIFY `status` VARCHAR(191) NULL,
    MODIFY `frequency` ENUM('ADHO', 'DAIL', 'WEEK', 'MNTH', 'QURT', 'MIAN', 'YEAR', 'BIMN', 'OOFF', 'RCUR') NULL,
    MODIFY `mandate_category` ENUM('U005', 'B001', 'A001', 'D001', 'I002', 'L002', 'E001', 'I001', 'L001', 'M001', 'F001', 'U099', 'T002', 'T001', 'U001', 'U003', 'U006') NULL;

-- AlterTable
ALTER TABLE `transaction` MODIFY `transaction_id` VARCHAR(191) NULL,
    MODIFY `user_id` VARCHAR(191) NULL,
    MODIFY `merchant_id` VARCHAR(191) NULL,
    MODIFY `txn_id` VARCHAR(191) NULL,
    MODIFY `monthly_emi` DECIMAL(65, 30) NULL,
    MODIFY `start_date` DATETIME(3) NULL,
    MODIFY `end_date` DATETIME(3) NULL,
    MODIFY `purpose` VARCHAR(191) NULL,
    MODIFY `max_amount` DECIMAL(65, 30) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `user_id` VARCHAR(191) NULL,
    MODIFY `name` VARCHAR(191) NULL,
    MODIFY `mobile` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `pan` VARCHAR(191) NULL,
    MODIFY `telephone` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user_mandate` MODIFY `transaction_id` VARCHAR(191) NULL,
    MODIFY `user_id` VARCHAR(191) NULL,
    MODIFY `amount` DECIMAL(65, 30) NULL,
    MODIFY `due_date` DATETIME(3) NULL,
    MODIFY `paid_date` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `merchant_slab` ADD CONSTRAINT `merchant_slab_merchant_id_fkey` FOREIGN KEY (`merchant_id`) REFERENCES `merchant`(`merchant_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_merchant_id_fkey` FOREIGN KEY (`merchant_id`) REFERENCES `merchant`(`merchant_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_mandate` ADD CONSTRAINT `user_mandate_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transaction`(`transaction_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_mandate` ADD CONSTRAINT `user_mandate_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
