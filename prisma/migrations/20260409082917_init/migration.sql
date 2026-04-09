/*
  Warnings:

  - You are about to alter the column `created_at` on the `exercises` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - You are about to alter the column `created_at` on the `foods` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - You are about to alter the column `created_at` on the `meals` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_exercises" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration_min" INTEGER NOT NULL,
    "calories" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_exercises" ("calories", "created_at", "date", "duration_min", "id", "name") SELECT "calories", "created_at", "date", "duration_min", coalesce("id", (lower(hex(randomblob(16))))) AS "id", "name" FROM "exercises";
DROP TABLE "exercises";
ALTER TABLE "new_exercises" RENAME TO "exercises";
CREATE INDEX "exercises_date_idx" ON "exercises"("date");
CREATE TABLE "new_foods" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "name" TEXT NOT NULL,
    "calories" REAL NOT NULL,
    "protein" REAL NOT NULL DEFAULT 0,
    "fat" REAL NOT NULL DEFAULT 0,
    "carbs" REAL NOT NULL DEFAULT 0,
    "serving" TEXT NOT NULL DEFAULT '1食分',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_foods" ("calories", "carbs", "created_at", "fat", "id", "name", "protein", "serving") SELECT "calories", "carbs", "created_at", "fat", coalesce("id", (lower(hex(randomblob(16))))) AS "id", "name", "protein", "serving" FROM "foods";
DROP TABLE "foods";
ALTER TABLE "new_foods" RENAME TO "foods";
CREATE INDEX "foods_name_idx" ON "foods"("name");
CREATE TABLE "new_meals" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "date" TEXT NOT NULL,
    "meal_type" TEXT NOT NULL,
    "food_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meals_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_meals" ("created_at", "date", "food_id", "id", "meal_type", "quantity") SELECT "created_at", "date", "food_id", coalesce("id", (lower(hex(randomblob(16))))) AS "id", "meal_type", "quantity" FROM "meals";
DROP TABLE "meals";
ALTER TABLE "new_meals" RENAME TO "meals";
CREATE INDEX "meals_date_idx" ON "meals"("date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
