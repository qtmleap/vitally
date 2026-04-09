-- CreateTable
CREATE TABLE "user_profiles" (
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");
