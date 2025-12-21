/*
  Warnings:

  - You are about to drop the column `from_email` on the `MailingSettings` table. All the data in the column will be lost.
  - You are about to drop the column `retry_attempts` on the `MailingSettings` table. All the data in the column will be lost.
  - You are about to drop the column `send_time` on the `MailingSettings` table. All the data in the column will be lost.
  - You are about to drop the column `smtp_host` on the `MailingSettings` table. All the data in the column will be lost.
  - You are about to drop the column `smtp_pass` on the `MailingSettings` table. All the data in the column will be lost.
  - You are about to drop the column `smtp_port` on the `MailingSettings` table. All the data in the column will be lost.
  - You are about to drop the column `smtp_user` on the `MailingSettings` table. All the data in the column will be lost.
  - Added the required column `fromEmail` to the `MailingSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smtpHost` to the `MailingSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smtpPass` to the `MailingSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smtpPort` to the `MailingSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smtpUser` to the `MailingSettings` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CardTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "background_image_url" TEXT NOT NULL,
    "text_template" TEXT NOT NULL,
    "font_size" INTEGER NOT NULL DEFAULT 48,
    "font_color" TEXT NOT NULL DEFAULT '#FFFFFF',
    "textX" INTEGER NOT NULL DEFAULT 100,
    "textY" INTEGER NOT NULL DEFAULT 200,
    "department_id" INTEGER,
    "position_id" INTEGER,
    CONSTRAINT "CardTemplate_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CardTemplate_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CardTemplate" ("background_image_url", "department_id", "font_color", "font_size", "id", "name", "position_id", "textX", "textY", "text_template") SELECT "background_image_url", "department_id", "font_color", "font_size", "id", "name", "position_id", "textX", "textY", "text_template" FROM "CardTemplate";
DROP TABLE "CardTemplate";
ALTER TABLE "new_CardTemplate" RENAME TO "CardTemplate";
CREATE TABLE "new_MailingSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "sendTime" TEXT NOT NULL DEFAULT '09:00',
    "smtpHost" TEXT NOT NULL,
    "smtpPort" INTEGER NOT NULL,
    "smtpUser" TEXT NOT NULL,
    "smtpPass" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "retryAttempts" INTEGER NOT NULL DEFAULT 3
);
INSERT INTO "new_MailingSettings" ("id") SELECT "id" FROM "MailingSettings";
DROP TABLE "MailingSettings";
ALTER TABLE "new_MailingSettings" RENAME TO "MailingSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
