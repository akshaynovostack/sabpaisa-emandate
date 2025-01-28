-- AlterTable
ALTER TABLE `user_mandate` ADD COLUMN `bank_account_number` VARCHAR(191) NULL,
    ADD COLUMN `bank_account_type` VARCHAR(191) NULL,
    ADD COLUMN `bank_ifsc` VARCHAR(191) NULL,
    ADD COLUMN `bank_name` VARCHAR(191) NULL,
    ADD COLUMN `bank_status_message` VARCHAR(191) NULL,
    ADD COLUMN `frequency` VARCHAR(191) NULL,
    ADD COLUMN `registration_status` VARCHAR(191) NULL;
