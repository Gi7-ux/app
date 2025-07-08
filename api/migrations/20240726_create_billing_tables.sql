-- INVOICES TABLE
CREATE TABLE IF NOT EXISTS `invoices` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `project_id` INT NOT NULL,
    `client_id` INT NOT NULL COMMENT 'The client being invoiced',
    `freelancer_id` INT NULL COMMENT 'Applicable if invoice is for a specific freelancer on the project',
    `invoice_number` VARCHAR(255) NOT NULL UNIQUE,
    `issue_date` DATE NOT NULL,
    `due_date` DATE NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'draft' COMMENT 'e.g., draft, sent, paid, overdue, cancelled',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`freelancer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INVOICE LINE ITEMS TABLE
CREATE TABLE IF NOT EXISTS `invoice_line_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` INT NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `related_time_log_id` INT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`related_time_log_id`) REFERENCES `time_logs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS `payments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` INT NULL COMMENT 'Link to an invoice if applicable',
    `project_id` INT NULL COMMENT 'If payment is directly for a project deposit or not tied to a specific invoice line item',
    `paid_by_user_id` INT NOT NULL COMMENT 'User who made the payment (e.g., client)',
    `paid_to_user_id` INT NULL COMMENT 'User who received the payment (e.g., freelancer, or platform admin for platform fees)',
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_date` DATE NOT NULL,
    `payment_method` VARCHAR(100) NULL COMMENT 'e.g., credit_card, bank_transfer, paypal, stripe_charge_id',
    `transaction_id` VARCHAR(255) NULL UNIQUE COMMENT 'External transaction ID, if any',
    `status` VARCHAR(50) NOT NULL DEFAULT 'completed' COMMENT 'e.g., pending, completed, failed, refunded',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL,
    FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
    FOREIGN KEY (`paid_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`paid_to_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add spend column to projects table if it doesn't exist
-- The client_summary report uses p.spend, let's ensure it's there.
-- From the client_summary.php, it looks like `spend` is already a column on projects.
-- If it wasn't, it would be:
-- ALTER TABLE `projects`
-- ADD COLUMN IF NOT EXISTS `spend` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Total amount spent/paid on the project';
-- This column would ideally be updated by triggers or application logic when payments are recorded.

-- Consider modifying the existing `projects` table to add `total_invoiced_amount`
-- and `total_paid_amount` for quick summaries, updated via triggers or app logic.
ALTER TABLE `projects`
ADD COLUMN IF NOT EXISTS `total_invoiced_amount` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Sum of all invoice totals for this project',
ADD COLUMN IF NOT EXISTS `total_paid_amount` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Sum of all payments made for this project';

-- It might also be useful to update users table for freelancers to track total_earned
-- and for clients to track total_spent at a user level.
ALTER TABLE `users`
ADD COLUMN IF NOT EXISTS `total_earned` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'For freelancers: total payments received',
ADD COLUMN IF NOT EXISTS `total_spent_as_client` DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'For clients: total payments made';

DELIMITER //

-- Triggers for `invoices` table
CREATE TRIGGER `after_invoice_insert`
AFTER INSERT ON `invoices`
FOR EACH ROW
BEGIN
    UPDATE `projects`
    SET `total_invoiced_amount` = `total_invoiced_amount` + NEW.total_amount
    WHERE `id` = NEW.project_id;
END;
//

CREATE TRIGGER `after_invoice_update`
AFTER UPDATE ON `invoices`
FOR EACH ROW
BEGIN
    -- Adjust total_invoiced_amount if total_amount changes
    IF OLD.total_amount != NEW.total_amount THEN
        UPDATE `projects`
        SET `total_invoiced_amount` = `total_invoiced_amount` - OLD.total_amount + NEW.total_amount
        WHERE `id` = NEW.project_id;
    END IF;

    -- Adjust total_invoiced_amount if status changes
    IF OLD.status IN ('sent', 'paid') AND NEW.status NOT IN ('sent', 'paid') THEN
        UPDATE `projects`
        SET `total_invoiced_amount` = `total_invoiced_amount` - NEW.total_amount
        WHERE `id` = NEW.project_id;
    ELSEIF OLD.status NOT IN ('sent', 'paid') AND NEW.status IN ('sent', 'paid') THEN
        UPDATE `projects`
        SET `total_invoiced_amount` = `total_invoiced_amount` + NEW.total_amount
        WHERE `id` = NEW.project_id;
    END IF;
END;
//

CREATE TRIGGER `after_invoice_delete`
AFTER DELETE ON `invoices`
FOR EACH ROW
BEGIN
    UPDATE `projects`
    SET `total_invoiced_amount` = `total_invoiced_amount` - OLD.total_amount
    WHERE `id` = OLD.project_id;
END;
//

-- Triggers for `payments` table
CREATE TRIGGER `after_payment_insert`
AFTER INSERT ON `payments`
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' THEN
        -- Update project's total_paid_amount
        IF NEW.project_id IS NOT NULL THEN
            UPDATE `projects`
            SET `total_paid_amount` = `total_paid_amount` + NEW.amount
            WHERE `id` = NEW.project_id;
        END IF;

        -- Update client's total_spent_as_client
        UPDATE `users`
        SET `total_spent_as_client` = `total_spent_as_client` + NEW.amount
        WHERE `id` = NEW.paid_by_user_id;

        -- Update freelancer's total_earned
        IF NEW.paid_to_user_id IS NOT NULL THEN
            UPDATE `users`
            SET `total_earned` = `total_earned` + NEW.amount
            WHERE `id` = NEW.paid_to_user_id;
        END IF;
    END IF;
END;
//

CREATE TRIGGER `after_payment_update`
AFTER UPDATE ON `payments`
FOR EACH ROW
BEGIN
    -- Adjust amounts if status changes to/from 'completed' or amount changes
    IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
        -- Payment status changed from completed to non-completed, subtract old amount
        IF OLD.project_id IS NOT NULL THEN
            UPDATE `projects`
            SET `total_paid_amount` = `total_paid_amount` - OLD.amount
            WHERE `id` = OLD.project_id;
        END IF;
        UPDATE `users`
        SET `total_spent_as_client` = `total_spent_as_client` - OLD.amount
        WHERE `id` = OLD.paid_by_user_id;
        IF OLD.paid_to_user_id IS NOT NULL THEN
            UPDATE `users`
            SET `total_earned` = `total_earned` - OLD.amount
            WHERE `id` = OLD.paid_to_user_id;
        END IF;
    ELSEIF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        -- Payment status changed from non-completed to completed, add new amount
        IF NEW.project_id IS NOT NULL THEN
            UPDATE `projects`
            SET `total_paid_amount` = `total_paid_amount` + NEW.amount
            WHERE `id` = NEW.project_id;
        END IF;
        UPDATE `users`
        SET `total_spent_as_client` = `total_spent_as_client` + NEW.amount
        WHERE `id` = NEW.paid_by_user_id;
        IF NEW.paid_to_user_id IS NOT NULL THEN
            UPDATE `users`
            SET `total_earned` = `total_earned` + NEW.amount
            WHERE `id` = NEW.paid_to_user_id;
        END IF;
    ELSEIF OLD.status = 'completed' AND NEW.status = 'completed' AND OLD.amount != NEW.amount THEN
        -- Payment remains completed, but amount changed, adjust by difference
        IF OLD.project_id IS NOT NULL THEN
            UPDATE `projects`
            SET `total_paid_amount` = `total_paid_amount` - OLD.amount + NEW.amount
            WHERE `id` = OLD.project_id;
        END IF;
        UPDATE `users`
        SET `total_spent_as_client` = `total_spent_as_client` - OLD.amount + NEW.amount
        WHERE `id` = OLD.paid_by_user_id;
        IF NEW.paid_to_user_id IS NOT NULL THEN
            UPDATE `users`
            SET `total_earned` = `total_earned` - OLD.amount + NEW.amount
            WHERE `id` = NEW.paid_to_user_id;
        END IF;
    END IF;
END;
//

CREATE TRIGGER `after_payment_delete`
AFTER DELETE ON `payments`
FOR EACH ROW
BEGIN
    IF OLD.status = 'completed' THEN
        -- Decrement project's total_paid_amount
        IF OLD.project_id IS NOT NULL THEN
            UPDATE `projects`
            SET `total_paid_amount` = `total_paid_amount` - OLD.amount
            WHERE `id` = OLD.project_id;
        END IF;

        -- Decrement client's total_spent_as_client
        UPDATE `users`
        SET `total_spent_as_client` = `total_spent_as_client` - OLD.amount
        WHERE `id` = OLD.paid_by_user_id;

        -- Decrement freelancer's total_earned
        IF OLD.paid_to_user_id IS NOT NULL THEN
            UPDATE `users`
            SET `total_earned` = `total_earned` - OLD.amount
            WHERE `id` = OLD.paid_to_user_id;
        END IF;
    END IF;
END;
//

DELIMITER ;
