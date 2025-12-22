-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BirthdayCardHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employee_id" INTEGER NOT NULL,
    "template_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "sent_at" DATETIME NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error_message" TEXT,
    CONSTRAINT "BirthdayCardHistory_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BirthdayCardHistory_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "CardTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BirthdayCardHistory" ("employee_id", "error_message", "id", "image_url", "sent_at", "success", "template_id") SELECT "employee_id", "error_message", "id", "image_url", "sent_at", "success", "template_id" FROM "BirthdayCardHistory";
DROP TABLE "BirthdayCardHistory";
ALTER TABLE "new_BirthdayCardHistory" RENAME TO "BirthdayCardHistory";
CREATE TABLE "new_CardTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "background_image_url" TEXT,
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
