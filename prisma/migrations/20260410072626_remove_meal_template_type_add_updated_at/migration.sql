-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ai_usage" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "user_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ai_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ai_usage" ("count", "date", "id", "user_id") SELECT "count", "date", "id", "user_id" FROM "ai_usage";
DROP TABLE "ai_usage";
ALTER TABLE "new_ai_usage" RENAME TO "ai_usage";
CREATE UNIQUE INDEX "ai_usage_user_id_date_key" ON "ai_usage"("user_id", "date");
CREATE TABLE "new_exercises" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration_min" INTEGER NOT NULL,
    "calories" REAL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "exercises_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_exercises" ("calories", "created_at", "date", "duration_min", "id", "name", "user_id") SELECT "calories", "created_at", "date", "duration_min", "id", "name", "user_id" FROM "exercises";
DROP TABLE "exercises";
ALTER TABLE "new_exercises" RENAME TO "exercises";
CREATE INDEX "exercises_user_id_date_idx" ON "exercises"("user_id", "date");
CREATE TABLE "new_foods" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "name" TEXT NOT NULL,
    "calories" REAL NOT NULL,
    "protein" REAL NOT NULL DEFAULT 0,
    "fat" REAL NOT NULL DEFAULT 0,
    "carbs" REAL NOT NULL DEFAULT 0,
    "serving" TEXT NOT NULL DEFAULT '1食分',
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "foods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_foods" ("calories", "carbs", "created_at", "fat", "id", "name", "protein", "serving", "user_id") SELECT "calories", "carbs", "created_at", "fat", "id", "name", "protein", "serving", "user_id" FROM "foods";
DROP TABLE "foods";
ALTER TABLE "new_foods" RENAME TO "foods";
CREATE INDEX "foods_user_id_name_idx" ON "foods"("user_id", "name");
CREATE TABLE "new_meal_template_items" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "template_id" TEXT NOT NULL,
    "food_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 1,
    CONSTRAINT "meal_template_items_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "meal_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meal_template_items_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_meal_template_items" ("food_id", "id", "quantity", "template_id") SELECT "food_id", "id", "quantity", "template_id" FROM "meal_template_items";
DROP TABLE "meal_template_items";
ALTER TABLE "new_meal_template_items" RENAME TO "meal_template_items";
CREATE TABLE "new_meal_templates" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "meal_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_meal_templates" ("created_at", "id", "name", "user_id") SELECT "created_at", "id", "name", "user_id" FROM "meal_templates";
DROP TABLE "meal_templates";
ALTER TABLE "new_meal_templates" RENAME TO "meal_templates";
CREATE INDEX "meal_templates_user_id_idx" ON "meal_templates"("user_id");
CREATE TABLE "new_meals" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "date" TEXT NOT NULL,
    "meal_type" TEXT NOT NULL,
    "food_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 1,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meals_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "meals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_meals" ("created_at", "date", "food_id", "id", "meal_type", "quantity", "user_id") SELECT "created_at", "date", "food_id", "id", "meal_type", "quantity", "user_id" FROM "meals";
DROP TABLE "meals";
ALTER TABLE "new_meals" RENAME TO "meals";
CREATE INDEX "meals_user_id_date_idx" ON "meals"("user_id", "date");
CREATE TABLE "new_user_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    "user_id" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "height_cm" REAL NOT NULL,
    "weight_kg" REAL NOT NULL,
    "body_fat_pct" REAL,
    "gender" TEXT NOT NULL,
    "activity_level" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "calorie_goal" INTEGER NOT NULL,
    "ai_advice_model" TEXT,
    "ai_utility_model" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_profiles" ("activity_level", "age", "ai_advice_model", "ai_utility_model", "body_fat_pct", "calorie_goal", "created_at", "gender", "goal", "height_cm", "id", "updated_at", "user_id", "weight_kg") SELECT "activity_level", "age", "ai_advice_model", "ai_utility_model", "body_fat_pct", "calorie_goal", "created_at", "gender", "goal", "height_cm", "id", "updated_at", "user_id", "weight_kg" FROM "user_profiles";
DROP TABLE "user_profiles";
ALTER TABLE "new_user_profiles" RENAME TO "user_profiles";
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

