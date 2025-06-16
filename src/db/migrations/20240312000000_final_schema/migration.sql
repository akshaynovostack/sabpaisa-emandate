-- CreateTable
CREATE TABLE `merchant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `merchant_id` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `token` VARCHAR(191) NULL,
    `merchant_code` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `status` TINYINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `merchant_id_key`(`merchant_id`),
    UNIQUE INDEX `merchant_code_key`(`merchant_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `merchant_slab` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `merchant_id` VARCHAR(191) NULL,
    `slab_from` DECIMAL(65, 30) NULL,
    `slab_to` DECIMAL(65, 30) NULL,
    `base_amount` DECIMAL(65, 30) NULL,
    `emi_amount` DECIMAL(65, 30) NULL,
    `emi_tenure` INTEGER NULL,
    `frequency` ENUM('ADHO', 'DAIL', 'WEEK', 'MNTH', 'QURT', 'MIAN', 'YEAR', 'BIMN', 'OOFF', 'RCUR') NULL,
    `duration` INTEGER NULL,
    `processing_fee` DECIMAL(65, 30) NULL,
    `effective_date` DATETIME(3) NULL,
    `expiry_date` DATETIME(3) NULL,
    `remarks` VARCHAR(191) NULL,
    `status` TINYINT NULL,
    `mandate_category` ENUM('U005', 'B001', 'A001', 'D001', 'I002', 'L002', 'E001', 'I001', 'L001', 'M001', 'F001', 'U099', 'T002', 'T001', 'U001', 'U003', 'U006') NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `merchant_slab_merchant_id_fkey`(`merchant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `mobile` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `pan` VARCHAR(191) NULL,
    `telephone` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permission` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permission` (
    `id` VARCHAR(191) NOT NULL,
    `role_id` INTEGER NOT NULL,
    `permission_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `role_id_permission_id_key`(`role_id`, `permission_id`),
    INDEX `role_permissions_permission_id_fkey`(`permission_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `mobile` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `role_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `name`(`name`),
    UNIQUE INDEX `email`(`email`),
    INDEX `teams_role_id_fkey`(`role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_id` VARCHAR(191) NULL,
    `client_transaction_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NULL,
    `merchant_id` VARCHAR(191) NULL,
    `monthly_emi` DECIMAL(65, 30) NULL,
    `start_date` DATETIME(3) NULL,
    `end_date` DATETIME(3) NULL,
    `purpose` VARCHAR(191) NULL,
    `max_amount` DECIMAL(65, 30) NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `sabpaisa_txn_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transaction_id_key`(`transaction_id`),
    INDEX `transaction_merchant_id_fkey`(`merchant_id`),
    INDEX `transaction_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_mandate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NULL,
    `amount` DECIMAL(65, 30) NULL,
    `due_date` DATETIME(3) NULL,
    `paid_date` DATETIME(3) NULL,
    `bank_account_number` VARCHAR(191) NULL,
    `bank_account_type` VARCHAR(191) NULL,
    `bank_name` VARCHAR(191) NULL,
    `bank_ifsc` VARCHAR(191) NULL,
    `frequency` VARCHAR(191) NULL,
    `registration_status` VARCHAR(191) NULL,
    `bank_status_message` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `user_mandate_transaction_id_fkey`(`transaction_id`),
    INDEX `user_mandate_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `merchant_slab` ADD CONSTRAINT `merchant_slab_merchant_id_fkey` FOREIGN KEY (`merchant_id`) REFERENCES `merchant`(`merchant_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team` ADD CONSTRAINT `team_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_merchant_id_fkey` FOREIGN KEY (`merchant_id`) REFERENCES `merchant`(`merchant_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_mandate` ADD CONSTRAINT `user_mandate_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transaction`(`transaction_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_mandate` ADD CONSTRAINT `user_mandate_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE; 