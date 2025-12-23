-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_birthday_preferences" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employee_id" INTEGER NOT NULL,
    "receive_email" BOOLEAN NOT NULL DEFAULT true,
    "receive_in_app" BOOLEAN NOT NULL DEFAULT true,
    "reminder_days_before" INTEGER NOT NULL DEFAULT 7,
    "send_time" TEXT NOT NULL DEFAULT '09:00',
    "show_birthday_public" BOOLEAN NOT NULL DEFAULT true,
    "allow_card_personalization" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "birthday_preferences_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_birthday_preferences" ("allow_card_personalization", "employee_id", "id", "receive_email", "receive_in_app", "reminder_days_before", "send_time", "show_birthday_public") SELECT coalesce("allow_card_personalization", true) AS "allow_card_personalization", "employee_id", "id", "receive_email", coalesce("receive_in_app", true) AS "receive_in_app", coalesce("reminder_days_before", 7) AS "reminder_days_before", coalesce("send_time", '09:00') AS "send_time", coalesce("show_birthday_public", true) AS "show_birthday_public" FROM "birthday_preferences";
DROP TABLE "birthday_preferences";
ALTER TABLE "new_birthday_preferences" RENAME TO "birthday_preferences";
CREATE UNIQUE INDEX "birthday_preferences_employee_id_key" ON "birthday_preferences"("employee_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
